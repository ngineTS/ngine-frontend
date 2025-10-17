import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";
import { UserSignInPayload, UserSignUpPayload } from "../../models/user.interface";

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    hasSignedIn = new BehaviorSubject(false);

    constructor(private _http: HttpClient){

        this.hasSignedIn.subscribe(resp => {
            if (resp) {
                setInterval(() => {
                  this.refreshToken().subscribe((resp: any) => {
                    localStorage.setItem('access_token', resp['access_token']);
                })
                }, 240000);   
            }
        })
        
    }

    forgotPwdPage: boolean = false;

    userSignUp(signUpDto: UserSignUpPayload): any {
        return this._http.post(`${environment.APIURL}user/sign-up`, signUpDto, { 
            withCredentials: true 
        }
);
    }

    userSignIn(signInDto: UserSignInPayload) {
        return this._http.post(`${environment.APIURL}auth/sign-in`, signInDto, {
            withCredentials: true 
        }
        );
    }

    checkIfEmailAddressAlreadyExists(emailAdress: string): Observable<boolean> {
        return this._http.get<boolean>(`${environment.APIURL}user/email-address/${emailAdress}`);
    }

    askForgotPasswordLink(emailAdress: string) {
        return this._http.get(`${environment.APIURL}password-recovery/forgot/${emailAdress}`);
    }

    resetUserPassword(resetPasswordObject: any) {
        return this._http.post(`${environment.APIURL}user/password-change`, resetPasswordObject);
    }

    refreshToken() {
        return this._http.post(`${environment.APIURL}auth/refresh`, 
            {}, 
            { withCredentials: true }
        );
    }


 }