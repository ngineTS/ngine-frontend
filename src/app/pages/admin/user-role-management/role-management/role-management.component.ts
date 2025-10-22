import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/models/role.interface';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-management',
  imports: [CommonModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {

  roles!: Observable<Array<Role>>;

  constructor(private _roleService: RoleService) { }

  ngOnInit() {
    this.roles = this._roleService.getAllRoles();
  }

}
