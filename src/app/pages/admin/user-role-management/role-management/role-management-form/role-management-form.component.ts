import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../../../core/models/role.interface';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { Navigation } from '../../../../../core/models/navigation.interface';
import { Permission } from '../../../../../core/models/permission.interface';
import { MatSelectModule } from '@angular/material/select';
import { PermissionService } from '../../../../../core/services/permission.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { RoleService } from '../../../../../core/services/role.service';
import { firstValueFrom } from 'rxjs';
import { RoleNavigationPermissionPayload } from '../../../../../core/models/role-navigation-permission.interface';

@Component({
  selector: 'app-role-management-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './role-management-form.component.html',
  styleUrl: './role-management-form.component.scss'
})
export class RoleManagementFormComponent implements OnInit{

    constructor(@Inject(MAT_DIALOG_DATA) 
                public _data: { role: Role },
                private _formBuilder: FormBuilder,
                private _permissionService: PermissionService,
                private _navigationService: NavigationService,
                private _roleService: RoleService
    ) {}

    roleForm!: FormGroup;
    navigations!: Navigation[];
    permissions! : Permission[];

    ngOnInit(): void {
      this._permissionService.getPermissions().subscribe(resp => this.permissions = resp);
      this._navigationService.getFlatNavigations().subscribe(resp => this.navigations = resp);
      this.roleForm = this._formBuilder.group({
        displayLabel: new FormControl(this._data.role.displayLabel ?? '', Validators.required),
        description: new FormControl(this._data.role.description ?? '', Validators.required),
        isDisabled: new FormControl(this._data.role.isDisabled ?? false),
        roleNavigationPermissions: this._formBuilder.array([])
      });

      if (this._data.role.roleNavigationPermissions) {
        for (let roleNavigationPermission of this._data.role.roleNavigationPermissions) {
          this.roleNavigationPermissions.push(
            this._formBuilder.group({
              navigationId: new FormControl(roleNavigationPermission.navigationId, Validators.required),
              permissionId: new FormControl(roleNavigationPermission.permissionId, Validators.required),
            })
          );
        }
      }
      else {
        this.roleNavigationPermissions.push(
          this._formBuilder.group({
            navigationId: new FormControl('', Validators.required),
            permissionId: new FormControl('', Validators.required),
          })
        );
      }
    }

    get roleNavigationPermissions() {
      return this.roleForm.get('roleNavigationPermissions') as FormArray;
    }

    addNavigationPermission() {
      console.log('salut');
      this.roleNavigationPermissions.push(
        this._formBuilder.group({
          navigationId: new FormControl('', Validators.required),
          permissionId: new FormControl('', Validators.required),
        })
      )
    }

    onRemoveNavigationPermissionClick(index: number) {
      console.log(index);
      this.roleNavigationPermissions.removeAt(index);
    }

    
    async saveRole() {
      const { roleNavigationPermissions, ...rolePayload } = this.roleForm.value;
      const roleId = (await firstValueFrom(this._roleService.saveRole(rolePayload))).id;
      const roleNavigationPermissionsPayload: Array<RoleNavigationPermissionPayload> = this.roleNavigationPermissions.value;
      roleNavigationPermissionsPayload.forEach(rnp => rnp.roleId = roleId);
      console.log(roleNavigationPermissionsPayload);
      this._roleService.saveRoleNavigationPermissions(roleNavigationPermissionsPayload).subscribe(resp => {
        console.log(resp);
      })
    }
    
    deleteRole() {

    }


}
