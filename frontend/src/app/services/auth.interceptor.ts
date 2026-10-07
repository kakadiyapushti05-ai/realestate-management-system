import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  //  FIX FOR localStorage is not defined (SSR safe)
  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem('token');

  //  If no token → send request normally
  if (!token) {
    return next(req);
  }

  // Attach token properly
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};
