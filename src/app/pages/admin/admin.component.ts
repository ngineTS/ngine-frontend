import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderBarService } from '../../core/services/header-bar.service';
import { HeaderBar } from '../../core/models/header-bar.interface';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _headerBarService: HeaderBarService) { }

  headerBarConfig: HeaderBar | undefined;
  isUserRoleManagementHovered = false;
  isAnalyticHovered = false;
  isFileManagementHovered = false;

  ngOnInit() {
    this._headerBarService.getMainHeaderBar().subscribe(resp => {
      this.headerBarConfig = resp;
    });
  }

  navigateToCardUrl(navigationName: string) {
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

}
