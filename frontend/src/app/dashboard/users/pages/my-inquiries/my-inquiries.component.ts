import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-inquiries',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './my-inquiries.component.html',
  styleUrls: ['./my-inquiries.component.css']
})
export class MyInquiriesComponent implements OnInit {

  inquiries: any[] = [];
  loading = true;
  isBrowser = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    if (!this.isBrowser) return;

    // 🔥 FIX: localStorage → sessionStorage
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error("Token not found");
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    try {

      // 🔥 Decode JWT
      const payload = JSON.parse(atob(token.split('.')[1]));

      const email = payload.email;

      if (!email) {
        console.error("Email not found in token");
        this.loading = false;
        return;
      }

      this.loadMyInquiries(email);

    } catch (err) {
      console.error("Token decode error", err);
      this.loading = false;
    }
  }

  /* ================= LOAD INQUIRIES ================= */

  loadMyInquiries(email: string): void {

    const token = sessionStorage.getItem('token');

    this.http.get<any>(
      `http://localhost:8000/api/inquiries/user/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({

      next: (res) => {

        console.log("INQUIRIES RESPONSE:", res);

        if (res && res.data) {
          this.inquiries = res.data;
        } else {
          this.inquiries = [];
        }

        this.loading = false;
      },

      error: (err) => {
        console.error("API Error:", err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️ Please login again");
          sessionStorage.clear();
          this.router.navigate(['/login']);
        }

        this.loading = false;
      }

    });
  }

  /* ================= STATUS ================= */

  getStatusClass(status: string): string {

    if (!status) return '';

    status = status.toLowerCase();

    if (status === 'pending') return 'pending';
    if (status === 'accepted') return 'accepted';
    if (status === 'rejected') return 'rejected';

    return '';
  }

  /* ================= NAV ================= */

  goBack() {
    this.router.navigate(['/user']);
  }
}