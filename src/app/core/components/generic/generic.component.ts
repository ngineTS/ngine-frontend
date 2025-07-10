import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { TestTextComponentComponent } from '../test-text-component/test-text-component.component';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestText } from '../test-text-component/models/test-text.interface';

@Component({
  selector: 'app-generic',
  imports: [MatTooltipModule],
  templateUrl: './generic.component.html',
  styleUrl: './generic.component.scss'
})
export class GenericComponent implements OnInit, AfterViewInit {

  constructor(private _route: ActivatedRoute) {}

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  injector = inject(Injector);
  content: TestText = {
                id: 'a',
                name: `0`,
                message: 'This is a cool message!',
                navigationId: 'string',
              }

  ngOnInit() {
    console.log("yeyeye");
    console.log(this._route.snapshot.data["navigations"]);
  }

  ngAfterViewInit() {
    this.loadComponents();
  }

  async loadComponents(){
    console.log(this.content);
    const imports = [];
    for (const navigation of this._route.snapshot.data["navigations"]) {
      imports.push(() => import('../test-text-component/test-text-component.component').then(m => m.TestTextComponentComponent));
    }
    for(const load of imports){
      const component = await load();
      const containerRef = this.container.createComponent(component, {
        injector: this.injector
      });
      containerRef.setInput('content', this.content);
    }
  }

}
