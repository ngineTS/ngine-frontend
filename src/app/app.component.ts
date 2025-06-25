import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from "../environments/environment";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private _http: HttpClient){}

  ngOnInit(){
    this._http.get(`${environment.APIURL}navigation`).subscribe(resp => console.log(resp));
  }


  title = 'my-app-frontend';
}
