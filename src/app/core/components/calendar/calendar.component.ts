import { CommonModule, DatePipe } from '@angular/common';
import { Component, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarApi, CalendarOptions, DateSelectArg, EventClickArg, EventHoveringArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, CalendarPayload } from '../../models/calendar.interface'
import { DeepFormConfig, GenericFormDialogData } from '../../models/form-input.interface';
import { Validators } from '@angular/forms';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable, retry, Subject, take, takeUntil } from 'rxjs';
import tippy from 'tippy.js';
import { MediaService } from '../../services/media.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  providers: [DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent extends NavigationBaseComponent {

  constructor(private _http: HttpClient,
              private _mediaService: MediaService) { 
                super(); 
              }

  @ViewChild('tooltipTemplate', { static: true }) tooltipTemplate!: TemplateRef<any>;
  @ViewChild('myFullCalendar') myFullCalendar!: FullCalendarComponent;
  tooltipInstance: any;
  calendarApi!: CalendarApi;
  fileIdUrlMapping: Record<string, Observable<string>> = {};
  calendarUnsubscribe = new Subject<void>();
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    selectable: true,
    fixedWeekCount: false,
    select: (arg: DateSelectArg) => this.handleDateSelection(arg),
    eventClick: (arg: EventClickArg) => this.handleEventClick(arg),
    eventMouseEnter: (arg: EventHoveringArg) => this.handleEventMouseEnter(arg),
    eventDidMount: (info) => {
      info.el.style.backgroundColor = this._navigation.typographyStyle.color ?? '';
      info.el.style.borderColor = this._navigation.typographyStyle.color ?? '';
      info.el.style.color = '#fff';
    },
    dayCellDidMount: (info) => { 
      const numberEl = info.el.querySelector('.fc-daygrid-day-number') as HTMLElement | null;
      numberEl!.style.color = this._navigation.typographyStyle.color ?? '';
    },
    dayHeaderDidMount: (info) => {
      const headerDaysEl = info.el.querySelector('.fc-col-header-cell-cushion') as HTMLElement | null;
      headerDaysEl!.style.color = this._navigation.typographyStyle.color ?? '';
    }
  };

  ngOnInit () {
    this.getCalendarEvent();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges["_width"]) {
      this.calendarApi?.updateSize();
    }
  }

  ngAfterViewInit() {
    this.calendarApi = this.myFullCalendar.getApi();
  }

  getCalendarEvent() {
    this._http.get<Calendar[]>(`${environment.APIURL}calendar/navigation/${this._navigation.id}`)
      .pipe(
        retry(this._retryCount),
        take(this._takeCount),
        map<Calendar[], CalendarOptions["events"]>(dbEvents => {
          const calendarEvents: CalendarOptions["events"] = [];
          dbEvents.forEach(event => {
            calendarEvents.push({
              id: event.id,
              title: event.url ? event.title + ' 🌐' : event.title,
              start: event.startDate,
              end: event.endDate,
              url: event.url,
              allDay: event.allDay,
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
    
    if (arg.event.extendedProps['fileId']) {
      if (this.fileIdUrlMapping[arg.event.extendedProps['fileId']]) {
        mediaUrl$ = this.fileIdUrlMapping[arg.event.extendedProps['fileId']];
      }
      else {
        mediaUrl$ = this._mediaService.getS3ObjectSignedUrl(arg.event.extendedProps['fileId']);
        this.fileIdUrlMapping[arg.event.extendedProps['fileId']] = mediaUrl$;
      }
    }

    const contentElement = document.createElement('div');
    const view = this.tooltipTemplate.createEmbeddedView({ 
        mediaUrl$: mediaUrl$,
        mediaType: arg.event.extendedProps['mediaType'],
        title: arg.event.title,
        description: arg.event.extendedProps['description'],
        startDate: `${arg.event.startStr}`,
        endDate: `${arg.event.endStr}`,
        allDay: arg.event.extendedProps['allDay']
      }
    );
    view.detectChanges();
    contentElement.appendChild(view.rootNodes[0]);
    
    if (arg.event.extendedProps["fileId"]) {
      mediaUrl$.pipe(takeUntil(this.calendarUnsubscribe)).subscribe(() => view.detectChanges());
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
    if (this._canAdd) {
      const calendarForm: DeepFormConfig<CalendarPayload> = {
        startDate: {
          value: arg.start,
          alias: 'Start date',
          type: 'date-and-time',
          validators: [Validators.required]
        },
        endDate: {
          value: arg.end,
          alias: 'End date',
          type: 'date-and-time',
          validators: [Validators.required]
        },
        description: {
          value: '',
          alias: 'Description',
          type: 'textarea',
          validators: []
        },
        title: {
          value: '',
          alias: 'Title',
          type: 'text',
          validators: [Validators.required]
        },
        category: {
          value: '',
          alias: 'Category',
          type: 'text',
          validators: []
        },
        url: {
          value: '',
          alias: 'URL',
          type: 'text',
          validators: []
        },
        allDay: {
          value: false,
          alias: 'All day',
          type: 'checkbox',
          validators: []
        },
        fileId: {
          value: '',
          alias: 'File',
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
  }

  handleEventClick(arg: EventClickArg) {
    if(this._canEdit && this._isEditing) {
      arg.jsEvent.preventDefault(); // don't let the browser navigate
      const calendarForm: DeepFormConfig<CalendarPayload> = {
        startDate: {
          value: arg.event.start,
          alias: 'Start date',
          type: 'date-and-time',
          validators: [Validators.required]
        },
        endDate: {
          value: arg.event.end,
          alias: 'End date',
          type: 'date-and-time',
          validators: []
        },
        description: {
          value: arg.event.extendedProps["description"],
          alias: 'Description',
          type: 'textarea',
          validators: []
        },
        title: {
          value: arg.event.url ? arg.event.title.substring(0, arg.event.title.indexOf(' 🌐')) : arg.event.title,
          alias: 'Title',
          type: 'text',
          validators: [Validators.required]
        },
        category: {
          value: arg.event.extendedProps["category"],
          alias: 'Category',
          type: 'text',
          validators: []
        },
        url: {
          value: arg.event.url,
          type: 'text',
          alias: 'Url',
          validators: []
        },
        allDay: {
          value: arg.event.extendedProps["allDay"],
          type: 'checkbox',
          alias: 'All day',
          validators: []
        },
        fileId: {
          value: arg.event.extendedProps["fileId"],
          type: 'file',
          alias: 'File',
          validators: []
        }
      }

      const dialogData: GenericFormDialogData<CalendarPayload> = {
        title: 'Edit event',
        formConfig: calendarForm,
        id: arg.event.id,
        navigationId: this._navigation.id,
        controllerName: 'calendar',
        hasDeleteButton: true 
      }

      const matDialogRef = this._matDialog.open(
        GenericFormComponent<CalendarPayload>,
        { 
          maxWidth: '700px',
          data: dialogData
        }
      );

      matDialogRef.afterClosed().subscribe(resp => {
        if (resp === 'edited' || resp === 'deleted') {
          this.getCalendarEvent();
        }
      });
    }
  }

  ngOnDestroy() {
    this.calendarUnsubscribe.next();
    this.calendarUnsubscribe.complete();
  }

}
