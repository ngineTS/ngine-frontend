import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../../core/services/role.service';
import { retry, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../../core/services/snackbar.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.interface';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import { Role } from '../../../../core/models/role.interface';


@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {

  filteredUsers!: Array<User>;
  users!: Array<User>;
  roles!: Array<Role>;

  constructor(private _roleService: RoleService,
              private _userService: UserService,
              private _snackbarService: SnackBarService) { }

  /**
   * On init, get all users and assign filteredUsers value.
   */
  ngOnInit() {
    this._roleService.getAllRoles().subscribe(resp => console.log(resp));
    this._userService.getAllUsers().subscribe(resp => {
      this.users = resp;
      this.filteredUsers = this.users;
      console.log(this.users);
    });
  }

  /**
   * Delete user and exclude it from roles array.
   * @param userId The user id to delete.
   */
  deleteUser(userId: string) {
    if (confirm("Are you sure to delete this user?")) {
      this._roleService.deleteRole(userId)
        .pipe(
          retry(2),
          take(1)
        )
        .subscribe(() => {

        }); 
    }
  }

  /**
   * Apply filter on displayLabel on search input keyup.
   * @param event The keyup event.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLocaleLowerCase();
    if (filterValue === '') {
      this.filteredUsers = this.users;
    }
    else {
      this.filteredUsers = this.users.filter(obj => 
        obj.name.trim().toLocaleLowerCase().includes(filterValue)
      );
    }
  }

  onDisableToggleChange(event: MatSlideToggleChange) {
    console.log(event.checked);

  }

}

