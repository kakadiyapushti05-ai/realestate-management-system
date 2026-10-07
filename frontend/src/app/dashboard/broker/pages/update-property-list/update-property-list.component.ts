import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './update-property-list.component.html',
  styleUrls: ['./update-property-list.component.css']
})
export class UpdatePropertyListComponent implements OnInit {

  properties: any[] = [];
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

    // 🔥 ADD TOKEN (sessionStorage)
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<any[]>(
        'http://localhost:8000/api/properties/all',
        { headers }
      )
      .subscribe({

        next: (res) => {
          this.properties = res;
        },

        error: (err) => {

          console.error("❌ ERROR:", err);

          if (err.status === 401 || err.status === 403) {
            alert("Session expired ⚠️");
            sessionStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  /* ================= NAV ================= */

  goToDashboard() {
    this.router.navigate(['/broker']);
  }
}