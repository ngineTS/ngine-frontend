import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { Role, RolePayload } from '../../models/role.interface';
import { retry, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RoleManagementFormComponent } from './role-management-form/role-management-form.component';
import { SnackBarService } from '../../services/snackbar.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';


@Component({
  selector: 'app-role-management',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent extends NavigationBaseComponent implements OnInit {

  filteredRoles!: Array<Role>;
  roles!: Array<Role>;

  constructor(
    private _roleService: RoleService,
    private _snackbarService: SnackBarService,
  ) { 
      super(); 
  }

  /**
   * On init, get all roles and assign filteredRoles value.
   */
  ngOnInit() {
    this.getAllRoles();
  }

  /**
   * Open role management form to add role.
   * After form closed, if role has been added then reload roles.
   */
  addRole() {
    const role: RolePayload = {
      displayLabel: '',
      description: '',
      isDisabled: false
    }
    const dialogRef = this._matDialog.open(RoleManagementFormComponent, {
      maxHeight: '92vh',
      data: {role: role}
    });
    dialogRef.afterClosed().subscribe(message => {
      if(message) {
        this.getAllRoles();
        this._snackbarService.showSuccessSnackBar(`Role ${message} successfully.`);
      }
    });
  }

  /**
   * Open role management form to edit role.
   * After form closed, if role has been edited then reload roles.
   * 
   * @param role The role to edit.
   */
  editRole(role: Role) {
    const dialogRef = this._matDialog.open(RoleManagementFormComponent, {
      maxHeight: '92vh',
      data: {role: role}
    });
    dialogRef.afterClosed().subscribe(message => {
      if (message) {
        this.getAllRoles();
        this._snackbarService.showSuccessSnackBar(`Role ${message} successfully.`);
      }
    });
  }

  /**
   * Delete role and exclude it from roles array.
   * 
   * @param roleId The role id to delete.
   */
  deleteRole(roleId: string) {
    if (confirm("Are you sure to delete this role and his dependencies?")) {
      this._roleService.deleteRole(roleId)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          this._snackbarService.showSuccessSnackBar(`Role deleted successfully.`);
          this.roles = this.roles.filter(role => role.id !== roleId);
          this.filteredRoles = this.roles;
        }); 
    }
  }

  /**
   * Apply filter on displayLabel on search input keyup.
   * 
   * @param event The keyup event.
   */
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

  /** 
   * Get all roles and assign filteredRoles value.
   */
  getAllRoles() {
    this._roleService.getAllRolesWithNavigationPermissions()
      .pipe(
        retry(2), 
        take(1)
      )
      .subscribe(resp => {
        this.roles = resp;
        this.filteredRoles = resp;
      }
    );
  }

}
