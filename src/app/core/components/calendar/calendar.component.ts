import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarApi, CalendarOptions, DateSelectArg, EventClickArg, EventHoveringArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, CalendarPayload } from '../../models/calendar.interface'
import { DeepFormConfig } from '../../models/form-input.interface';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { Navigation } from '../../models/navigation.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable, take } from 'rxjs';
import { ComponentSize } from '../../models/component-size.interface';
import tippy from 'tippy.js';
import { MediaService } from '../../services/media.service';
import { NavigationComponent } from '../navigation/navigation.component';
import { NavigationService } from '../../services/navigation.service';


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  providers: [DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent extends NavigationComponent {

  constructor(private _http: HttpClient,
              private _datePipe: DatePipe,
              private _mediaService: MediaService,
              _matDialog: MatDialog,
              _navigationService: NavigationService) { 
                super(_matDialog, _navigationService); 
              }

  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate!: TemplateRef<any>;
  @ViewChild('myFullCalendar') myFullCalendar!: FullCalendarComponent;
  tooltipInstance: any;
  calendarApi!: CalendarApi;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    selectable: true,
    fixedWeekCount: false,
    select: (arg: DateSelectArg) => this.handleDateSelection(arg),
    eventClick: (arg: EventClickArg) => this.handleEventClick(arg),
    eventMouseEnter: (arg: EventHoveringArg) => this.handleEventMouseEnter(arg)
  };

  override ngOnInit () {
    console.log('navigation', this._navigation);
    console.log('canAdd', this._canAdd);
    console.log('canEdit', this._canEdit);
    this.getCalendarEvent();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges["componentSize"]) {
      this.calendarApi.updateSize();
    }
  }

  override ngAfterViewInit() {
    this.calendarApi = this.myFullCalendar.getApi();
  }

  getCalendarEvent() {
    this._http.get<Calendar[]>(`${environment.APIURL}calendar/navigation/${this._navigation.id}`)
              .pipe(
                take(1),
                map<Calendar[], CalendarOptions["events"]>(dbEvents => {
                  const calendarEvents: CalendarOptions["events"] = [];
                  dbEvents.forEach(event => {
                    calendarEvents.push({
                      id: event.id,
                      title: event.url ? event.title + ' 🌐' : event.title,
                      start: event.allDay ? this._datePipe.transform(event.startDate, 'yyyy-MM-dd') ?? undefined : event.startDate,
                      end: event.allDay ? this._datePipe.transform(event.endDate, 'yyyy-MM-dd') ?? undefined : event.endDate,
                      url: event.url,
                      extendedProps: {
                        description: event.description,
                        category: event.category,
                        allDay: event.allDay,
                        fileId: event.fileId,
                        mediaType: event.media?.type
                      }
                    });
                  });
                  return calendarEvents;
                })
              )
              .subscribe(resp => {
                this.calendarOptions.events = resp;
              });
  }

  handleEventMouseEnter(arg: EventHoveringArg) {
    let mediaUrl$!: Observable<string>;
    
    if (arg.event.extendedProps["fileId"]) { 
      mediaUrl$ = this._mediaService.getS3ObjectSignedUrl(arg.event.extendedProps["fileId"]);
    }

    const contentElement = document.createElement('div');
    const view = this.tooltipTemplate.createEmbeddedView({ 
        mediaUrl$: mediaUrl$,
        mediaType: arg.event.extendedProps["mediaType"],
        title: arg.event.title,
        description: arg.event.extendedProps["description"],
        date: `${arg.event.startStr} - ${arg.event.endStr}`
      }
    );
    view.detectChanges();
    contentElement.appendChild(view.rootNodes[0]);
    
    if (arg.event.extendedProps["fileId"]) {
      mediaUrl$.subscribe(() => view.detectChanges());
    }

    if (this.tooltipInstance) {
      this.tooltipInstance.destroy();
      this.tooltipInstance = null;
    }

    this.tooltipInstance = tippy(arg.el, {
        content: contentElement,
        allowHTML: true,
        interactive: true,
        placement: 'auto',
        appendTo: document.body
      }
    )
  }


  handleDateSelection(arg: DateSelectArg) {
    console.log('navigation', this._navigation);
    console.log('canAdd', this._canAdd);
    console.log('canEdit', this._canEdit);
    const calendarForm: DeepFormConfig<CalendarPayload> = {
      startDate: {
        value: arg.start,
        type: 'date-and-time',
        validators: [Validators.required]
      },
      endDate: {
        value: arg.end,
        type: 'date-and-time',
        validators: [Validators.required]
      },
      description: {
        value: '',
        type: 'textarea',
        validators: []
      },
      title: {
        value: '',
        type: 'text',
        validators: [Validators.required]
      },
      category: {
        value: '',
        type: 'text',
        validators: []
      },
      url: {
        value: '',
        type: 'text',
        validators: []
      },
      allDay: {
        value: false,
        type: 'checkbox',
        validators: []
      },
      fileId: {
        value: '',
        type: 'file',
        validators: []
      }
    }

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<CalendarPayload>,
      { 
        maxWidth: '700px',
        data: {
          formConfig: calendarForm,
          id: null,
          navigationId: this._navigation.id,
          controllerName: 'calendar',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added') {
        this.getCalendarEvent();
      }
    });
  }

  handleEventClick(arg: EventClickArg) {
    if(this._canEdit) {
      arg.jsEvent.preventDefault(); // don't let the browser navigate
      const calendarForm: DeepFormConfig<CalendarPayload> = {
        startDate: {
          value: arg.event.start ?? new Date(),
          type: 'date-and-time',
          validators: [Validators.required]
        },
        endDate: {
          value: arg.event.end ?? new Date(),
          type: 'date-and-time',
          validators: [Validators.required]
        },
        description: {
          value: arg.event.extendedProps["description"],
          type: 'textarea',
          validators: []
        },
        title: {
          value: arg.event.url ? arg.event.title.substring(0, arg.event.title.indexOf(' 🌐')) : arg.event.title,
          type: 'text',
          validators: [Validators.required]
        },
        category: {
          value: arg.event.extendedProps["category"],
          type: 'text',
          validators: []
        },
        url: {
          value: arg.event.url,
          type: 'text',
          validators: []
        },
        allDay: {
          value: arg.event.extendedProps["allDay"],
          type: 'checkbox',
          validators: []
        },
        fileId: {
          value: arg.event.extendedProps["fileId"],
          type: 'file',
          validators: []
        }
      }

      const matDialogRef = this._matDialog.open(
        GenericFormComponent<CalendarPayload>,
        { 
          maxWidth: '700px',
          data: {
            formConfig: calendarForm,
            id: arg.event.id,
            navigationId: this._navigation.id,
            controllerName: 'calendar',
          }
        }
      );

      matDialogRef.afterClosed().subscribe(resp => {
        if (resp === 'edited' || resp === 'deleted') {
          this.getCalendarEvent();
        }
      });

    }
  }

}
