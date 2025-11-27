import { Component } from '@angular/core';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-user-role-management',
  imports: [MatTabsModule, RouterModule],
  templateUrl: './user-role-management.component.html',
  styleUrl: './user-role-management.component.scss'
})
export class UserRoleManagementComponent {

  constructor(private _router: Router,
              private _route: ActivatedRoute) {}

  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 1) {
      this._router.navigate(['user-management'], {relativeTo: this._route});
    }
    else {
      this._router.navigate(['role-management'], {relativeTo: this._route});
    }
  }
}
