import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.services';

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private API = 'http://localhost:8000/api/properties';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  addProperty(data: FormData): Observable<any> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.API}/add`, data, { headers });
  }

  //  ADD THIS METHOD
  getPropertyById(id: string): Observable<any> {
    return this.http.get(`${this.API}/${id}`);
  }
}
