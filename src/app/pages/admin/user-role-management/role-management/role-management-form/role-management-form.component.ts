import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../../../core/models/role.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-role-management-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './role-management-form.component.html',
  styleUrl: './role-management-form.component.scss'
})
export class RoleManagementFormComponent implements OnInit{

  constructor(@Inject(MAT_DIALOG_DATA) 
              private _data: { role: Role },
              private _formBuilder: FormBuilder,
              private _permissionService: PermissionService,
              private _navigationService: NavigationService,
              private _roleService: RoleService,
              private _dialogRef: MatDialogRef<RoleManagementFormComponent>,
  ) {}

  roleForm!: FormGroup;
  navigations!: Navigation[];
  permissions! : Permission[];
  isSaving = false;

  /**
   * On init,
   * - Create form model.
   * - Get permission and navigation data to be used as items of dropdown.
   */
  ngOnInit(): void {
    this._permissionService.getPermissions().subscribe(resp => this.permissions = resp);
    this._navigationService.getFlatNavigations().subscribe(resp => this.navigations = resp);
    this.roleForm = this._formBuilder.group({
      displayLabel: new FormControl(this._data.role.displayLabel ?? '', Validators.required),
      description: new FormControl(this._data.role.description ?? '', Validators.required),
      isDisabled: new FormControl(this._data.role.isDisabled ?? false),
      roleNavigationPermissions: this._formBuilder.array([])
    });

    if (this._data.role.roleNavigationPermissions 
        && this._data.role.roleNavigationPermissions.length > 0
      ) {
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

  /**
   * roleNavigationPermissions FormArray accessor
   */
  get roleNavigationPermissions() {
    return this.roleForm.get('roleNavigationPermissions') as FormArray;
  }

  /** 
   * Methods triggered on '+ Add' click.
   * Add another set of navigation permission inputs.
   */
  addNavigationPermission() {
    this.roleNavigationPermissions.push(
      this._formBuilder.group({
        navigationId: new FormControl('', Validators.required),
        permissionId: new FormControl('', Validators.required),
      })
    )
  }

  /**
   * Methods triggered on trash icon click.
   * Remove roleNavigationPermission combination by given index.
   * @param index The roleNavigationPermission index.
   */
  onRemoveNavigationPermissionClick(index: number) {
    this.roleNavigationPermissions.removeAt(index);
  }

  /**
   * Save role.
   * @returns A promise of the saved role id.
   */
  async saveRole() {
    const { roleNavigationPermissions, ...rolePayload } = this.roleForm.value;
    return (await firstValueFrom(this._roleService.saveRole(rolePayload))).id;
  }

  /**
   * Save roleNavigationsPermissions.
   * @returns A promise of roleNavigationPermissions.
   */
  async saveRoleNavigationPermissions(roleId: string) {
    const roleNavigationPermissionsPayload: Array<RoleNavigationPermissionPayload> = this.roleNavigationPermissions.value;
    roleNavigationPermissionsPayload.forEach(rnp => rnp.roleId = roleId);
    return await firstValueFrom(this._roleService.bulkSaveRoleNavigationPermissions(roleNavigationPermissionsPayload));
  }

  /**
   * Update role.
   */
  async updateRole() {
    const { roleNavigationPermissions, ...rolePayload } = this.roleForm.value;
    await firstValueFrom(this._roleService.updateRole(this._data.role.id, rolePayload));
  }


  /**
   * Methods triggered on 'Save' button click.
   * 
   * Add or update role then close the pop up.
   */
  async submitForm() {
    this.isSaving = true;
    if (this._data.role.id) {
      await this.updateRole();
      await this.saveRoleNavigationPermissions(this._data.role.id);
      this._dialogRef.close('edited');
    }
    else {
      const roleId = await this.saveRole();
      await this.saveRoleNavigationPermissions(roleId);
      this._dialogRef.close('added');
    }
  }

}
