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
    ) {}

    roleForm!: FormGroup;
    navigations!: Navigation[];
    permissions! : Permission[];

    ngOnInit(): void {
      this._permissionService.getPermissions().subscribe(resp => {
        console.log(resp);
        this.permissions = resp;
      });
      this._navigationService.getFlatNavigations().subscribe(resp => {
        console.log(resp);
        this.navigations = resp;
      })
      this.roleForm = this._formBuilder.group({
        displayLabel: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        isDisabled: new FormControl(false),
        roleNavigationPermissions: this._formBuilder.array([])
      });
      this.roleNavigationPermissions.push(
        this._formBuilder.group({
          navigationId: new FormControl('', Validators.required),
          permissionId: new FormControl('', Validators.required),
        })
      );
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

    
    saveRole() {

    }
    
    deleteRole() {

    }


}
