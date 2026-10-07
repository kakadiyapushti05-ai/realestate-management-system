import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InquiryService {

 private API_URL = 'http://localhost:8000/api/inquiries';


  constructor(private http: HttpClient) {}
  

  submitInquiry(data: any) {
    return this.http.post(this.API_URL, data);
  }
}
