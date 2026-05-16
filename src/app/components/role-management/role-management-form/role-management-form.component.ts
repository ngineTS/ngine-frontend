import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../../core/models/role.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Navigation } from '../../../core/models/navigation.interface';
import { Permission } from '../../../core/models/permission.interface';
import { MatSelectModule } from '@angular/material/select';
import { PermissionService } from '../../../core/services/permission.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { RoleService } from '../../../core/services/role.service';
import { catchError, firstValueFrom, retry, take, throwError } from 'rxjs';
import { RoleNavigationPermissionPayload } from '../../../core/models/role-navigation-permission.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-role-management-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  templateUrl: './role-management-form.component.html',
  styleUrl: './role-management-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleManagementFormComponent implements OnInit{

  constructor(@Inject(MAT_DIALOG_DATA) 
              private _data: { role: Role },
              private _formBuilder: FormBuilder,
              private _permissionService: PermissionService,
              private _navigationService: NavigationService,
              private _roleService: RoleService,
              private _dialogRef: MatDialogRef<RoleManagementFormComponent>
             ) { }

  roleForm!: FormGroup;
  navigations!: Array<Navigation>;
  permissions! : Array<Permission>;
  isSaving = false;
  title: string = 'Add Role';

  /**
   * Lifecycle hook called after component has been initialized.
   * - Setup title up to form status (add or edit).
   * - Create form model.
   * - Get navigation dropdown items and add "All navigations" item.
   * - Get Permission dropdown items.
   */
  ngOnInit(): void {
    if(this._data.role.id) this.title = 'Edit Role';

    this._permissionService.getPermissions().pipe(
      retry(2),
      take(1)
    ).subscribe(resp => this.permissions = resp);

    this._navigationService.getFlatNavigations().pipe(
      retry(2),
      take(1)
    ).subscribe(resp => this.navigations = resp);
    
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
   * 
   * @returns A promise of the saved role id.
   */
  async saveRole() {
    const { roleNavigationPermissions, ...rolePayload } = this.roleForm.value;
    return (await firstValueFrom(this._roleService.saveRole(rolePayload)
      .pipe(catchError(err => {
        this.isSaving = false;
        return throwError(() => err.error);
      }))
    )).id;
  }

  /**
   * Save roleNavigationsPermissions.
   * 
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
    await firstValueFrom(this._roleService.updateRole(this._data.role.id, rolePayload)
      .pipe(catchError(err => {
        this.isSaving = false;
        return throwError(() => err.error);
      }))
    );
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

  /**
   * TODO: Find another way to detect selected navigation. This way has to bad performances.
   * Check if given navigation is already selected.
   * 
   * @param navigationId The dropdown option to check.
   * @returns True if it is selected, false if not.
   * 
   */
  isNavigationSelected(navigationId: string): boolean {
    const isSelected = this.roleNavigationPermissions.controls.find(obj => 
      obj.value['navigationId'] === navigationId
    );
    return isSelected ? true : false;
  }

}
