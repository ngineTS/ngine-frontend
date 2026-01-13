import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderBarService } from '../../core/services/header-bar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Menu } from '../../core/models/menu.interface';

@Component({
  selector: 'app-admin',
  imports: [MatTooltipModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _headerBarService: HeaderBarService) { }

  headerBarConfig: Menu | undefined;
  isUserRoleManagementHovered = false;
  isAnalyticHovered = false;
  isFileManagementHovered = false;
  isAuthenticationManagementHovered = false;

  ngOnInit() {
    this.headerBarConfig = this._route.snapshot.data["headerBarConfig"];
  }

  navigateToCardUrl(navigationName: string) {
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

}
