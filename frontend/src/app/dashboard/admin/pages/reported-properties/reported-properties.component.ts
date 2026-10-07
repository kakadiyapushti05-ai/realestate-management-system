import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reported-properties',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './reported-properties.component.html',
  styleUrls: ['./reported-properties.component.css']
})
export class ReportedPropertiesComponent implements OnInit {

  reportedProperties: any[] = [];
  isBrowser = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.getReported();
    }
  }

  /* ================= BACK ================= */
  goBack() {
    this.router.navigate(['/admin']);
  }

  /* ================= GET REPORTED ================= */
  getReported() {

    if (!this.isBrowser) return;

    // 🔥 FIX: sessionStorage
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any[]>(
      'http://localhost:8000/api/properties/reported',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({
      next: (res) => {
        console.log("🔥 REPORTED:", res);
        this.reportedProperties = res || [];
      },
      error: (err) => {

        console.error("❌ ERROR:", err);

        if (err.status === 401 || err.status === 403) {
          alert("Access denied ⚠️ Please login again");
          sessionStorage.clear();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /* ================= DELETE ================= */
  deleteProperty(id: string) {

    if (!confirm("Are you sure you want to delete this property?")) return;

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session expired ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    this.http.delete(
      `http://localhost:8000/api/properties/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({
      next: () => {
        alert("✅ Property deleted");
        this.getReported();
      },
      error: (err) => {

        console.error(err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️");
          sessionStorage.clear();
          this.router.navigate(['/login']);
          return;
        }

        alert(err?.error?.message || "Delete failed ❌");
      }
    });
  }

  /* ================= RESOLVE ================= */
  resolveProperty(id: string) {

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session expired ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    this.http.put(
      `http://localhost:8000/api/properties/resolve/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({
      next: () => this.getReported(),
      error: (err) => {

        console.error(err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️");
          sessionStorage.clear();
          this.router.navigate(['/login']);
        }
      }
    });
  }
}