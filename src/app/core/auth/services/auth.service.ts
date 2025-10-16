import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { catchError, throwError } from "rxjs";
import { UserSignInPayload, UserSignUpPayload } from "../../models/user.interface";

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(private _http: HttpClient){ }

    forgotPwdPage: boolean = false;

    userSignUp(signUpDto: UserSignUpPayload): any {
        return this._http.post(`${environment.APIURL}user/sign-up`, signUpDto);
    }

    userSignIn(signInDto: UserSignInPayload) {
        return this._http.post(`${environment.APIURL}auth/sign-in`, signInDto);
    }

    checkIfEmailAddressAlreadyExists(emailAdress: string): any {
        return this._http.get(`${environment.APIURL}user/email-address/${emailAdress}`);
    }

    askForgotPasswordLink(emailAdress: string) {
        return this._http.get(`${environment.APIURL}password-recovery/forgot/${emailAdress}`);
    }

    resetUserPassword(resetPasswordObject: any): any{
        return this._http.post(`${environment.APIURL}user/password-change`, resetPasswordObject);
    }


 }