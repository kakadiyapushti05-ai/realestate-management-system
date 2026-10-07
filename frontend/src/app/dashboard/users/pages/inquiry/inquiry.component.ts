import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})
export class InquiryComponent implements OnInit {

  propertyId: string | null = null;
  isBrowser = false;

  inquiryData = {
    username: '',
    email: '',
    phone: '',
    inquiryFor: '',
    budget: 0,
    visitTime: '',
    message: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    this.propertyId = this.route.snapshot.paramMap.get('id');

    // 🔥 TOKEN CHECK (ONLY redirect if really missing)
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Please login first ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    if (this.propertyId) {
      this.fetchProperty();
    }

    this.autoFillUserFromToken();
  }

  /* ================= AUTO FILL ================= */

  autoFillUserFromToken(): void {

    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));

      this.inquiryData.username =
        payload.name ||
        payload.email?.split('@')[0] ||
        '';

      this.inquiryData.email = payload.email || '';

    } catch (err) {
      console.error('Token decode error:', err);
    }
  }

  /* ================= PROPERTY ================= */

  fetchProperty(): void {

    this.http
      .get<any>(`http://localhost:8000/api/properties/${this.propertyId}`)
      .subscribe({
        next: (property) => {
          this.inquiryData.inquiryFor =
            property.propertyStatus?.toLowerCase() || '';
        }
      });
  }

  /* ================= SUBMIT ================= */

  submitInquiry(): void {

    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      ...this.inquiryData,
      propertyId: this.propertyId
    };

    this.http.post(
      'http://localhost:8000/api/inquiries',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({
      next: () => {
        alert("Inquiry submitted ✅");

        this.inquiryData.message = '';
        this.inquiryData.visitTime = '';
        this.inquiryData.budget = 0;
      },
      error: () => {
        alert("Failed ❌");
      }
    });
  }

  /* ================= NAV ================= */

  goBack() {
    this.router.navigate(['/user']);
  }
}