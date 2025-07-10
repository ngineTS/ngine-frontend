import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from './models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-navigation',
  imports: [
            RouterOutlet, 
            RouterModule, 
            CommonModule, 
            MatTooltipModule
           ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute) {}

  navigations!: Navigation[];

  ngOnInit(){
    this.navigations = this._route.snapshot.data["navigations"];
  }

  isRouteActive(navigationName: string){
    return this._router.url.includes(navigationName);
  }

  ngOnDestroy(){
    console.log('DESTROY', this.navigations);
  }

}
