import { KeyValuePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-sorter',
  imports: [
    MatButtonModule,
    MatMenuModule,
    KeyValuePipe
  ],
  templateUrl: './sorter.component.html',
  styleUrl: './sorter.component.scss'
})
export class SorterComponent<T extends Record<string, any>> {

  @Input() obj!: T;
  @Output() sortEvent: EventEmitter<{
    key: keyof T; 
    sortDirection: 'ASC' | 'DESC'
  }> = new EventEmitter();
  valueSelected: string = '';

  onSelectionChange(key: keyof T, sortDirection: 'ASC' | 'DESC') {
    this.valueSelected = key as string + sortDirection;
    this.sortEvent.emit({key: key, sortDirection: sortDirection})
  }

}
