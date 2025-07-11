import { AfterViewInit, Component, inject, Injector, inputBinding, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { TestTextComponentComponent } from '../test-text-component/test-text-component.component';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestText } from '../test-text-component/models/test-text.interface';
import { Navigation } from '../navigation/models/navigation.interface';

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

  componentStore: Record<string, () => Promise<any>> = {
    text: () => import(`../test-text-component/test-text-component.component`)
  }
  //new Map<string, () => Promise<unknown>>();

  ngOnInit() {
    console.log("yeyeye");
    console.log(this._route.snapshot.data["navigations"]);
  }

  ngAfterViewInit() {
    //this.componentStore.set('text', () => import(`../test-text-component/test-text-component.component`));
    this.loadComponents();

  }

  async loadComponents(){
    console.log(this._route.snapshot.data["navigations"]);
    for (const navigation of this._route.snapshot.data["navigations"] as Navigation[]) {
      const component = await this.componentStore[navigation.navigationType.name]()
                        .then(m => m["Test" + navigation.navigationType.name.charAt(0).toUpperCase() + navigation.navigationType.name.slice(1) + "ComponentComponent"]);
      const containerRef = this.container.createComponent(component, {
        injector: this.injector
      });
      //in real condition:
      //don't pass testText object but call API to get content on component init
      // --> no inputs needed
      containerRef.setInput('content', navigation.testText);
    }
  }

}
