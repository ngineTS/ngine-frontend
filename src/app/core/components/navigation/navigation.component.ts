import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from './models/navigation.interface';

@Component({
  selector: 'app-navigation',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute) {}

  children!: Navigation[];

  ngOnInit(){
    console.log(this._route.snapshot.data);
    this.children = this._route.snapshot.data["children"];
  }

  isRouteActive(navigationName: string){
    return this._router.url.includes(navigationName);
  }

  ngOnDestroy(){
    console.log('DESTROY', this.children);
  }

}
