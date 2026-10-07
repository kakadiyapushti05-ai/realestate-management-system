import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

interface Inquiry {
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  budget?: string | number;
  visitTime?: string;
  message?: string;
  status?: 'pending' | 'accepted' | 'rejected';

  propertyId?: {
    propertyname: string;
    city: string;
    area: string;
    propertyprice?: number;     // ✅ FIXED
    propertyStatus?: string; 
  };
}

@Component({
  selector: 'app-inquiry-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './inquiry-details.component.html',
  styleUrls: ['./inquiry-details.component.css']
})
export class InquiryDetailsComponent implements OnInit {

  inquiries: Inquiry[] = [];
  loading = false;
  isBrowser = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.getBrokerInquiries();
    }
  }

  /* ================= GET INQUIRIES ================= */

  getBrokerInquiries(): void {

    this.loading = true;

    // 🔥 FIX: sessionStorage
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(
      'http://localhost:8000/api/inquiries/broker',
      { headers }
    ).subscribe({

      next: (res) => {

        this.inquiries = (res.data || []).map((i: Inquiry) => ({
          ...i,
          status: i.status || 'pending'
        }));

        this.loading = false;
      },

      error: (err) => {

        console.error('❌ Inquiry error:', err);

        if (err.status === 401 || err.status === 403) {
          alert("Access denied ⚠️ Please login again");
          sessionStorage.clear();
          this.router.navigate(['/login']);
          return;
        }

        this.loading = false;
      }
    });
  }

  /* ================= UPDATE STATUS ================= */

  updateStatus(inquiry: Inquiry, status: 'accepted' | 'rejected') {

    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.patch(
      `http://localhost:8000/api/inquiries/${inquiry._id}/status`,
      { status: status },
      { headers }
    ).subscribe({

      next: () => {

        alert("Inquiry " + status + " ✅");

        if (inquiry) {
          inquiry.status = status;
        }
      },

      error: (err) => {

        console.error("❌ Status update error", err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️");
          sessionStorage.clear();
          this.router.navigate(['/login']);
          return;
        }

        alert("Update failed ❌");
      }
    });
  }

  /* ================= NAV ================= */

  goToDashboard() {
    this.router.navigate(['/broker']);
  }
}