import { Component, Input, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-generic-table',
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    MatButton
  ],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss'
})
export class GenericTableComponent<T extends Record<string, any>> {

  displayedColumns: Array<string> = [];
  dataSource!: MatTableDataSource<T>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() content!: Array<T>;
  @Input() canAdd!: boolean;
  @Input() canEdit!: boolean;

  constructor() { }

  ngOnInit() {
    for (const key in this.content[0]) {
      this.displayedColumns.push(key);
    }
    if (this.canEdit) {
      this.displayedColumns.push('edit');
    }
    this.dataSource = new MatTableDataSource(this.content);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

