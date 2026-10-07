import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8000/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /* ================= TOKEN ================= */

  getToken(): string {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem('token') || '';
    }
    return '';
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getToken()}`
      })
    };
  }

  /* ================= AUTH ================= */

  signup(data: any): Observable<any> {
    return this.http.post(`${this.API}/signup`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.API}/login`, data);
  }

  forgotPassword(data: any): Observable<any> {
    return this.http.post(`${this.API}/forgot-password`, data);
  }

  /* ================= SESSION ================= */

  saveSession(user: any, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);
    }
  }

  getUser(): any | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
  }

  /* ================= PROFILE ================= */

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.API}/me`, this.getHeaders());
  }

  /* ================= ADMIN ================= */

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/users`,
      this.getHeaders()
    );
  }

  getAllBrokers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API}/brokers`,
      this.getHeaders()
    );
  }

  deleteUser(id: string) {
    return this.http.delete(
      `${this.API}/user/${id}`,
      this.getHeaders()
    );
  }

  sendOTP(data:any){
  return this.http.post('http://localhost:8000/api/auth/send-otp', data);
}

verifyOTP(data:any){
  return this.http.post('http://localhost:8000/api/auth/verify-otp', data);
}
}