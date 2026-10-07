import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const authGuard = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if(isPlatformBrowser(platformId)){

    const token = localStorage.getItem('token');

    if(token){
      return true;
    }
  }

  router.navigate(['/login']);
  return false;
};
