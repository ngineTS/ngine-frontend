import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationComponent } from '../navigation/navigation.component';
import { MenuService } from '../../services/menu.service';
import { AppService } from '../../services/app.service';
import { SnackBarService } from '../../services/snackbar.service';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take } from 'rxjs';


@Component({
  selector: 'app-components-container',
  imports: [
    MatTooltipModule, 
    CommonModule, 
    CdkDrag,
    CdkDragHandle,
    MatProgressSpinnerModule,
    MatMenuModule,
    NavigationComponent
  ],
  templateUrl: './components-container.component.html',
  styleUrl: './components-container.component.scss'
})
export class ComponentsContainer implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _navigationService: NavigationService,
    private _menuService: MenuService,
    private _appService: AppService,
    private _snackbarService: SnackBarService,
    private _router: Router,
    private _containerLayoutService: ContainerLayoutService,
  ) {}

  /** The components container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** The window height. */
  windowHeight!: number;
  /** Responsive threasold */
  windowWidthLimit = 600;

  /**
   * Get window size each time it changes (zoom, screen resize...).
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  /**
   * Lifecyle hook called after the component has been initialized.
   * - retrieve route snapshot data properties
   * - sort navigation children for mobile screen responsivity
   */
  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.navigation = this._route.snapshot.data["navigation"];

    if (this.windowWidth < this.windowWidthLimit) {
      this.navigation.children?.sort((a, b) => {
        const aXPosRounded = Math.ceil(a.containerLayout.xPos! / 10) * 10;
        const bXPosRounded = Math.ceil(b.containerLayout.xPos! / 10) * 10;
        const aYPosRounded = Math.ceil(a.containerLayout.yPos! / 10) * 10;
        const bYPosRounded = Math.ceil(b.containerLayout.yPos! / 10) * 10;

        if (aXPosRounded !== bXPosRounded) {
          return aXPosRounded - bXPosRounded; // priority: xPos
        }

        return aYPosRounded - bYPosRounded; // secondary: yPos
      });
    }
  }

  /**
   * Methods called on '+' button click.
   * Open navigation form to create navigation or navigation bar.
   * 
   * @param type The type ('navigation-bar' or 'navigation').
   */
  openFormToAddNavigationBarOrNavigation(type: 'navigation-bar' | 'navigation'): void {
    if (type !== 'navigation-bar') {
      this._navigationService.manageNavigation(this.navigation.id);
    }
    else {
      this._menuService.createNavigationBar(this.navigation.id)
        .subscribe(resp => {
          this._snackbarService.showSuccessSnackBar(resp);
          this._appService.createAppRouting(this._router.url);
        });
    }
  }

  
  /**
   * Method called when drag ends.
   * 
   * Get dragged navigation position, convert it to percentage of screen size and save it.
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    const position = event.source.getFreeDragPosition();

    const navigationPosition = {
      xPos: Math.round(position.x / window.innerWidth * 10000) / 100,
      yPos: Math.round(position.y / window.innerHeight * 10000) / 100,
    }

    // Prevent dragging beyond top screen border
    if (navigationPosition.yPos < 0) {
      navigationPosition.yPos = 0;
    }

    // Prevent dragging beyond left screen border
    if (navigationPosition.xPos < 0) {
      navigationPosition.xPos = 0;
    }

    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(() => {
        navigation.containerLayout.xPos = navigationPosition.xPos;
        navigation.containerLayout.yPos = navigationPosition.yPos;
      });
  }

}
