import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarApi, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
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
import { map, take } from 'rxjs';
import { ComponentSize } from '../../models/component-size.interface';


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  providers: [DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  constructor(private _matDialog: MatDialog,
              private _http: HttpClient,
              private _datePipe: DatePipe) {}

  @Input() navigation!: Navigation;
  @Input() componentSize!: ComponentSize;
  canEdit = true;

  @ViewChild('myFullCalendar') myFullCalendar!: FullCalendarComponent;
  calendarApi!: CalendarApi;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    selectable: true,
    select: (arg: DateSelectArg) => this.handleDateSelection(arg),
    eventClick: (arg: EventClickArg) => this.handleEventClick(arg)
  };

  ngOnInit() {
    this.getCalendarEvent();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if(simpleChanges["componentSize"]) {
      this.calendarApi.updateSize();
    }
  }

  ngAfterViewInit() {
    this.calendarApi = this.myFullCalendar.getApi();
  }

  getCalendarEvent() {
    this._http.get<Calendar[]>(`${environment.APIURL}calendar/navigation/${this.navigation.id}`)
              .pipe(
                take(1),
                map<Calendar[], CalendarOptions["events"]>(dbEvents => {
                  const calendarEvents: CalendarOptions["events"] = [];
                  dbEvents.forEach(event => {
                    calendarEvents.push({
                      id: event.id,
                      title: event.title,
                      start: event.allDay ? this._datePipe.transform(event.startDate, 'yyyy-MM-dd') ?? undefined : event.startDate,
                      end: event.allDay ? this._datePipe.transform(event.endDate, 'yyyy-MM-dd') ?? undefined : event.endDate,
                      url: event.url,
                      extendedProps: {
                        description: event.description,
                        category: event.category,
                        allDay: event.allDay
                      }
                    });
                  });
                  return calendarEvents;
                })
              )
              .subscribe(resp => {
                this.calendarOptions.events = resp;
                console.log(resp);
              });
  }


  handleDateSelection(arg: DateSelectArg) {
    console.log(arg);
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
        value: null,
        type: 'textarea',
        validators: []
      },
      title: {
        value: null,
        type: 'text',
        validators: [Validators.required]
      },
      category: {
        value: null,
        type: 'text',
        validators: []
      },
      url: {
        value: null,
        type: 'text',
        validators: []
      },
      allDay: {
        value: false,
        type: 'checkbox',
        validators: []
      }
    }

    this._matDialog.open(
      GenericFormComponent<CalendarPayload>,
      { 
        maxWidth: '700px',
        data: {
          formConfig: calendarForm,
          id: null,
          navigationId: this.navigation.id,
          controllerName: 'calendar',
        }
      }
    );
  }

  handleEventClick(arg: EventClickArg) {
    if(this.canEdit) {

      arg.jsEvent.preventDefault(); // don't let the browser navigate
      const calendarForm: DeepFormConfig<CalendarPayload> = {
        startDate: {
          value: arg.event.start,
          type: 'date-and-time',
          validators: [Validators.required]
        },
        endDate: {
          value:  arg.event.end,
          type: 'date-and-time',
          validators: [Validators.required]
        },
        description: {
          value: arg.event.extendedProps["description"],
          type: 'textarea',
          validators: []
        },
        title: {
          value: arg.event.title,
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
        }
      }

      this._matDialog.open(
        GenericFormComponent<CalendarPayload>,
        { 
          maxWidth: '700px',
          data: {
            formConfig: calendarForm,
            id: null,
            navigationId: this.navigation.id,
            controllerName: 'calendar',
          }
        }
      );

    }
  }



}
