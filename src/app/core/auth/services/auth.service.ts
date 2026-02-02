import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { BehaviorSubject, Observable, take } from "rxjs";
import { UserSignInPayload, UserSignUpPayload } from "../../models/user.interface";
import { jwtDecode, JwtPayload } from "jwt-decode";

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(private _http: HttpClient) {}

    forgotPwdPage: boolean = false;

    userSignUp(signUpDto: UserSignUpPayload): any {
        return this._http.post(`${environment.APIURL}user/sign-up`, signUpDto).pipe(take(1));
    }

    userSignIn(signInDto: UserSignInPayload) {
        return this._http.post(`${environment.APIURL}auth/sign-in`, signInDto).pipe(take(1));
    }

    guestSignIn() {
        return this._http.get(`${environment.APIURL}auth/guest-sign-in`).pipe(take(1));
    }

    checkIfEmailAddressAlreadyExists(emailAdress: string): Observable<boolean> {
        return this._http.get<boolean>(`${environment.APIURL}user/email-address/${emailAdress}`).pipe(take(1));
    }

    askForgotPasswordLink(emailAdress: string) {
        return this._http.get(`${environment.APIURL}password-recovery/forgot/${emailAdress}`).pipe(take(1));
    }

    resetUserPassword(resetPasswordObject: any) {
        return this._http.post(`${environment.APIURL}user/password-change`, resetPasswordObject).pipe(take(1));
    }

    refreshToken() {
        return this._http.post(`${environment.APIURL}auth/refresh`, {}).pipe(take(1));
    }

    getCurrentUser(): { [prop: string]: any} | null {
        const token = localStorage?.getItem('access_token');
        if (!token) return null;

        try {
            return jwtDecode<JwtPayload>(token);
        } catch {
            return null;
        }
    }

 }