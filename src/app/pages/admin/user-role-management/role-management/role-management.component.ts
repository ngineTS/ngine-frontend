import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/models/role.interface';
import { retry, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { RoleManagementFormComponent } from './role-management-form/role-management-form.component';


@Component({
  selector: 'app-role-management',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {

  filteredRoles!: Array<Role>;
  roles!: Array<Role>;

  constructor(private _roleService: RoleService,
              private _matDialog: MatDialog) { }

  ngOnInit() {
    this._roleService.getAllRoles().pipe(retry(2), take(1))
      .subscribe(resp => {
        this.roles = resp;
        this.filteredRoles = resp;
      });
  }

  addRole() {
    console.log('add role');
    this._matDialog.open(RoleManagementFormComponent, {
      maxHeight: '92vh'
    });
  }

  editRole(role: Role) {
    console.log(role)
  }

  deleteRole(roleId: string) {
    console.log(roleId);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
    if (filterValue === '') {
      this.filteredRoles = this.roles;
    }
    else {
      this.filteredRoles = this.roles.filter(obj => 
        obj.displayLabel.trim().toLocaleLowerCase().includes(filterValue)
      );
    }
  }

}
