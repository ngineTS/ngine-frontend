import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, Query, QueryList, Type, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { GenericService } from '../../services/generic.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic',
  imports: [MatTooltipModule, CommonModule],
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.scss'
})
export class GenericComponent implements OnInit, AfterViewInit {

  constructor(private _route: ActivatedRoute,
              private genericService: GenericService) {}

  @ViewChildren('container', { read: ViewContainerRef }) container!: QueryList<ViewContainerRef>;
  injector = inject(Injector);
  navigations!: Navigation[];

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  ngAfterViewInit() {
    this.loadComponents();
  }

  async loadComponents() {
    this.container.map(async (vcr: ViewContainerRef, index: number) => {
      const component = await this.genericService.componentStore[this.navigations[index].navigationType.name]()
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

}
