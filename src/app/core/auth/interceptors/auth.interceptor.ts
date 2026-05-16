import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { SnackBarService } from "../../services/snackbar.service";

export const tokenInterceptior: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const _router = inject(Router);
  const _snackbarService = inject(SnackBarService);

  let token: string | null = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('access_token');
  }
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}`}
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        _router.navigateByUrl('/unauthorised');
      }
      _snackbarService.showErrorSnackBar(err.error.message);
      return throwError(() => err.error);
    })
  );
}
