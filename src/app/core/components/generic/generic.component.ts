import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'app-generic',
  imports: [MatTooltipModule],
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.scss'
})
export class GenericComponent implements OnInit, AfterViewInit {

  constructor(private _route: ActivatedRoute,
              private genericService: GenericService) {}

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  injector = inject(Injector);

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadComponents();
  }

  async loadComponents(){
    if (this._route.snapshot.data["navigations"]) {
      for (const navigation of this._route.snapshot.data["navigations"] as Navigation[]) {
        const component = await this.genericService.componentStore[navigation.navigationType.name]()
                          .then(m => m[this.kebabCasetoPascaleCase(navigation.navigationType.name) + 'Component']);
        const containerRef = this.container.createComponent(component, {
          injector: this.injector
        });
        containerRef.setInput('navigation', navigation);
      }
    }
  }

  kebabCasetoPascaleCase(input: string) {
    return input
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

}
