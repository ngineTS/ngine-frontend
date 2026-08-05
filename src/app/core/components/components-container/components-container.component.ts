import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationComponent } from '../navigation/navigation.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take } from 'rxjs';
import { ComponentsContainerService } from '../../services/components-container.service';


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
    private _containerLayoutService: ContainerLayoutService,
    public _componentsContainerService: ComponentsContainerService,
  ) { }

  /** The components container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** The window height. */
  windowHeight!: number;
  /** Responsive threasold */
  windowWidthLimit = 750;
  /** The HTML container */
  @ViewChild('componentsContainer') componentsContainerRef!: ElementRef<HTMLDivElement>;

  /**
   * Get window size each time it changes (zoom, screen resize...).
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this._componentsContainerService.currentWidth = this.componentsContainerRef.nativeElement.offsetWidth;
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
    this._componentsContainerService.activeNavigation = this.navigation;
    console.log(this._componentsContainerService.activeNavigation);

    if (this.windowWidth < this.windowWidthLimit) {
      this.navigation.children?.sort((a, b) => 
        (Number(a.containerLayout.xPos!) + Number(a.containerLayout.yPos!)) 
          - (Number(b.containerLayout.xPos!) + Number(b.containerLayout.yPos!))
      );
    }
  }

  /**
   * Lifecycle hook called after the component view has been initialized.
   */
  ngAfterViewInit() {
    this._componentsContainerService.currentWidth = this.componentsContainerRef.nativeElement.offsetWidth;
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
        navigation.unpublishedChanges.push('containerLayout');
        navigation.containerLayout.xPos = navigationPosition.xPos;
        navigation.containerLayout.yPos = navigationPosition.yPos;
      });
  }

}
