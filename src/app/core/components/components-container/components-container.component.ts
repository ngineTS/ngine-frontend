import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { ComponentsContainerService } from '../../services/components-container.service';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NavigationComponent } from '../navigation/navigation.component';


@Component({
  selector: 'app-components-container',
  imports: [
    MatTooltipModule, 
    CommonModule, 
    CdkDropList, 
    CdkDrag,
    CdkDragHandle,
    MatProgressSpinnerModule,
    MatMenuModule,
    NavigationComponent
  ],
  templateUrl: './components-container.component.html',
  styleUrl: './components-container.component.scss'
})
export class ComponentsContainer implements OnInit, AfterViewInit {

  constructor(private _route: ActivatedRoute,
              private _componentContainerService: ComponentsContainerService,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog) {}

  @ViewChildren('container', { read: ViewContainerRef }) container!: QueryList<ViewContainerRef>;
  injector = inject(Injector);
  navigations!: Array<Navigation>;

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  ngAfterViewInit() {
    this.loadComponents();
  }

  async loadComponents() {
    this.container.map(async (vcr: ViewContainerRef, index: number) => {
      const component = await this._componentContainerService.componentStore[this.navigations[index].navigationType.name]()
        .then(m => m[this.kebabCasetoPascaleCase(this.navigations[index].navigationType.name) + 'Component']);
      vcr.createComponent(component, {
        injector: this.injector,
        bindings: [
          inputBinding('_navigation', () => this.navigations[index]),
          inputBinding('_canEdit', () => false),
          inputBinding('_canAdd', () => false),
        ]
      });
    });
  }

  kebabCasetoPascaleCase(input: string) {
    return input
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  drop(event: CdkDragDrop<Navigation[]>) {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => navigationOrders.push({ id: navigation.id, order: index }));
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(resp => {});
  }

  /**
   * Methods trigered on '+' button click.
   * 
   * Open navigation management form to add header or component
   * depending on the type passed.
   * @param type The type ('header' or 'component').
   */
  openFormToAddHeaderOrComponent(type: 'header' | 'component') {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: undefined,
        type: type,
        parentId: this._route.snapshot.data["parentId"]
      }
    });
  }

}
