import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, Query, QueryList, Type, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { GenericService } from '../../services/generic.service';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';


@Component({
  selector: 'app-generic',
  imports: [
    MatTooltipModule, 
    CommonModule, 
    CdkDropList, 
    CdkDrag,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.scss'
})
export class GenericComponent implements OnInit, AfterViewInit {

  constructor(private _route: ActivatedRoute,
              private _genericService: GenericService,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog) {}

  @ViewChildren('container', { read: ViewContainerRef }) container!: QueryList<ViewContainerRef>;
  injector = inject(Injector);
  navigations!: Navigation[];
  isSavingOrder: boolean = false;

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  ngAfterViewInit() {
    this.loadComponents();
  }

  async loadComponents() {
    this.container.map(async (vcr: ViewContainerRef, index: number) => {
      const component = await this._genericService.componentStore[this.navigations[index].navigationType.name]()
        .then(m => m[this.kebabCasetoPascaleCase(this.navigations[index].navigationType.name) + 'Component']);
      const containerRef = vcr.createComponent(component, {
        injector: this.injector
      });  
      containerRef.setInput('navigation', this.navigations[index]);
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

  openNavigationManagementForm(type: 'header' | 'component', navigation?: Navigation) {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: type,
        parentId: this._route.snapshot.data["parentId"]
      }
    });
  }

}
