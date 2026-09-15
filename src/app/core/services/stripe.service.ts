import { Injectable } from "@angular/core";
import { Stripe} from '@stripe/stripe-js'
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class StripeService {

    constructor(private _http: HttpClient) {}

    baseURL = environment.APIURL;

    async redirectToCheckout(priceId: string) {
       this._http
        .get<{ url: string }>(`${this.baseURL}stripe-payment/create-checkout-session/${priceId}`)
        .pipe(take(1))
    }
}