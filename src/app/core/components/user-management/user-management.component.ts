import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { retry, switchMap, take, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../services/snackbar.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { Role } from '../../models/role.interface';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { UserRolePayload } from '../../models/user-role.interface';
import { ActivatedRoute } from '@angular/router';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';


@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent extends NavigationBaseComponent implements OnInit {

  filteredUsers!: Array<User>;
  users!: Array<User>;
  roles!: Array<Role>;
  userNgModel: Record<string, {
    isEnabled: boolean;
    roleIds: string[];
  }> = {};

  constructor(private _roleService: RoleService,
              private _userService: UserService,
              private _snackbarService: SnackBarService,
              private _route: ActivatedRoute) { super(); }

  /**
   * Lifecycle hook called after component has been initialized.
   * Get roles dropdown items.
   * Get all users and assign filteredUsers.
   */
  ngOnInit() {
    this._roleService.getAllRoles()
      .pipe(
        retry(2),
        take(1)
      )
      .subscribe(resp => this.roles = resp.filter(obj => obj.name !== 'guest'));
    this._userService.getAllUsers()
      .pipe(
        retry(2),
        take(1),
        tap(users => {
          users.forEach(user => this.userNgModel[user.id] = {
            isEnabled: !user.isDisabled,
            roleIds: user.userRoles?.map(userRole => userRole.roleId) ?? [],
          })
        })
      )
      .subscribe(resp => {
        this.users = resp;
        this.filteredUsers = this.users;
      });
  }

  /**
   * Delete user and exclude it from roles array.
   * 
   * @param userId The user id to delete.
   */
  deleteUser(userId: string) {
    if (confirm("Are you sure to delete this user?")) {
      this._userService.deleteUser(userId)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          this._snackbarService.showSuccessSnackBar('User deleted successfully.')
          this.users = this.users.filter(user => user.id !== userId);
          this.filteredUsers = this.users;
        }); 
    }
  }

  /**
   * Methods called on ✓ button click.
   * Update user and his roles assignment.
   * 
   * @param userId The user id to update.
   */
  async onSaveUserClick(userId: string) {
    if (confirm("Do you want to update this user?")) {
      this.updateUser(userId)
        .pipe(
          take(1),
          switchMap(x => this.saveUserRoles(userId))
        )
        .subscribe(() => this._snackbarService.showSuccessSnackBar('User updated successfully.'));
    }
  }

  /**
   * Update user props based on userNgModel value.
   * 
   * @param userId The user id to update.
   */
  updateUser(userId: string) {
    const userPayload = { isDisabled: !this.userNgModel[userId].isEnabled }
    return this._userService.updateUser(userId, userPayload);
  }
  
  /**
   * Save user roles.
   * 
   * @param userId The user id to update.
   * @returns An observable of array of users that have been saved.
   */
  saveUserRoles(userId: string) {
    const userRolesPayload: Array<UserRolePayload> = [];
    this.userNgModel[userId].roleIds.forEach(roleId => {
      userRolesPayload.push({
        userId: userId,
        roleId: roleId
      })
    });
    return this._userService.bulksaveUserRoles(userId, userRolesPayload);
  }

  /**
   * Apply filter on displayLabel on search input keyup.
   * 
   * @param event The keyup event.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
    if (filterValue === '') {
      this.filteredUsers = this.users;
    }
    else {
      this.filteredUsers = this.users.filter(obj => 
        obj.emailAddress.trim().toLocaleLowerCase().includes(filterValue)
      );
    }
  }

}

