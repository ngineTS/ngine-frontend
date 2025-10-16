import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignContainerComponent } from '../sign-container/sign-container.component';
import { ActivatedRoute } from '@angular/router';
import { PasswordRecoveryComponent } from '../password-recovery/password-recovery.component';

@Component({
  selector: 'app-unauthorised',
  imports: [],
  templateUrl: './unauthorised.component.html',
  styleUrl: './unauthorised.component.scss'
})
export class UnauthorisedComponent implements OnInit{

  constructor(private _matDialog: MatDialog,
              private _route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this._route.snapshot.params['token']) {
      this._matDialog.open(PasswordRecoveryComponent, {
        disableClose: true,
        data: { 
          token: this._route.snapshot.params['token']
        }
      });
    }
    else {
      this._matDialog.open(SignContainerComponent, {
        disableClose: true,
      });
    }
  }

}
