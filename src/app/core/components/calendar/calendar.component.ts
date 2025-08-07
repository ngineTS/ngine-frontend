import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
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


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  constructor(private _matDialog: MatDialog,
              private _http: HttpClient) {}

  @Input() navigation!: Navigation;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: any) => this.handleDateClick(arg),
    events: [
      { title: 'event 1', date: '2025-06-01' },
      { title: 'event 2', date: '2025-06-02' }
    ]
  };
  
  ngOnInit() {
    this.getCalendarEvent();
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
                      start: event.startDate,
                      end: event.endDate,
                      url: event.url,
                      extendedProps: {
                        description: event.description
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

  handleDateClick(arg: any) {
    const calendarForm: DeepFormConfig<CalendarPayload> = {
      startDate: {
        value: null,
        type: 'date',
        validators: [Validators.required]
      },
      endDate: {
        value: null,
        type: 'date',
        validators: []
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
