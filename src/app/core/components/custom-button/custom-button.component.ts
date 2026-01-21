import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypographyStyle } from '../../models/typography-style.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';

@Component({
  selector: 'app-custom-button',
  imports: [MatTooltipModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.scss'
})
export class CustomButtonComponent {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
  ) {}

  @Input() navigation!: Navigation
  @Input() typographyStyle!: TypographyStyle;
  @Input() iconOnTop? = false;
  isMouseOver = false;

  /**
   * Navigate to given route name.
   * @param navigationName The name of the route.
   */
  navigateTo(navigationName: string) {
    console.log('navName', navigationName);
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

  /**
   * Check wether the user is in this navigation or not (used in case button is in navigation bar).
   * @param navigationName The navigation name to check.
   * @returns true or false.
   */
  isRouteActive(navigationName: string) {
    const urlList = this._router.url.split('/');
    return urlList.includes(navigationName);
  }

}
