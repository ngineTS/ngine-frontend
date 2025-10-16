import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";

export const tokenInterceptior: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  let token: string | null = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('access_token');
  }
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        router.navigateByUrl('/unauthorised');
      }
      throw err.error;
    })
  );
}
