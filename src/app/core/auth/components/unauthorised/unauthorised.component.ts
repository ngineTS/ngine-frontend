import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignContainerComponent } from '../sign-container/sign-container.component';

@Component({
  selector: 'app-unauthorised',
  imports: [],
  templateUrl: './unauthorised.component.html',
  styleUrl: './unauthorised.component.scss'
})
export class UnauthorisedComponent implements OnInit{

  constructor(private _matDialog: MatDialog) { }

  ngOnInit(): void {
    this._matDialog.open(SignContainerComponent, {
      disableClose: true,
    });
  }

}
