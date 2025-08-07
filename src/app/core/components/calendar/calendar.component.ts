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


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

  constructor(private _matDialog: MatDialog) {}

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
