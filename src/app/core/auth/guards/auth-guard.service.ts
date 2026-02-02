import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CanActivate, Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";

/**
 * Not needed since guest sign in before loading navigations.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
                public dialog: MatDialog) {}
  
    canActivate() {
      
      let token: string | null = null; 
      if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      let jwtDecoded: any;
      if (token) {
        jwtDecoded = jwtDecode(token);
      }
      const jwtExpirationTime: number = jwtDecoded?.exp;
      const currentTime: number = new Date().getTime() / 1000;
      console.log(currentTime);
      console.log(jwtExpirationTime);
      if (jwtExpirationTime && jwtExpirationTime >= currentTime) {
        return true;
      }
      else {
        this.router.navigateByUrl('unauthorised');
        return false;
      }
      
  }

}