import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  adminName = 'Admin';

  totalUsers = 0;
  totalBrokers = 0;
  totalProperties = 0;

  token = '';
  isBrowser = false;

  cityData: Record<string, number> = {};
  salesData = { rent: 0, sale: 0, sold: 0 };

  maxCityValue = 0;

  constructor(
    private http: HttpClient,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

  if (!this.isBrowser) return;

  const storedToken = sessionStorage.getItem('token');

  if (!storedToken) {
    this.router.navigate(['/login']);
    return;
  }

  this.token = storedToken;

  this.getAdminProfile();
  this.getUsers();
  this.getBrokers();
  this.getProperties();
}
  // ================= ADMIN PROFILE =================

  getAdminProfile() {
    this.http.get<any>(
      'http://localhost:8000/api/auth/me',
      this.getHeaders()
    ).subscribe({
      next: (res) => {
        this.adminName = res.role === 'admin'
          ? 'Admin'
          : res.name;
      },
      error: (err) => {
        console.error("Profile fetch error", err);
      }
    });
  }

  // ================= HEADERS =================

  getHeaders() {
  return {
    headers: new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    })
  };
}

  // ================= USERS =================

  getUsers() {
    this.http.get<any>(
      'http://localhost:8000/api/auth/users',
      this.getHeaders()
    )
    .subscribe({
      next: (res) => this.totalUsers = res.length || 0,
      error: (err) => this.handleError(err)
    });
  }

  // ================= BROKERS =================

  getBrokers() {
    this.http.get<any>(
      'http://localhost:8000/api/auth/brokers',
      this.getHeaders()
    )
    .subscribe({
      next: (res) => this.totalBrokers = res.length || 0,
      error: (err) => this.handleError(err)
    });
  }

  // ================= PROPERTIES =================

  getProperties() {
    this.http.get<any>(
      'http://localhost:8000/api/properties/all',
      this.getHeaders()
    )
    .subscribe({
      next: (res) => {

        this.totalProperties = res.length;

        this.cityData = {};
        res.forEach((p: any) => {
          const city = p.city || 'Unknown';
          this.cityData[city] = (this.cityData[city] || 0) + 1;
        });

        this.maxCityValue = Math.max(...Object.values(this.cityData), 0);

        this.salesData = { rent: 0, sale: 0, sold: 0 };

        res.forEach((p: any) => {
          const s = p.propertyStatus?.toLowerCase();
          if (s === 'rent') this.salesData.rent++;
          else if (s === 'sale') this.salesData.sale++;
          else if (s === 'sold') this.salesData.sold++;
        });

      },
      error: (err) => this.handleError(err)
    });
  }

  // ================= ERROR =================

 handleError(err: any) {

  console.error("❌ API Error:", err);

  if (!this.isBrowser) return;

  if (err.status === 401 || err.status === 403) {
    sessionStorage.clear(); // ✅ FIX
    this.router.navigate(['/login']);
  }
}

  // ================= GRAPH =================

  getHeight(value: number): number {
    const maxHeight = 150;
    return this.maxCityValue
      ? (value / this.maxCityValue) * maxHeight
      : 0;
  }

  // ================= NAVIGATION =================

  goToUsers() { this.router.navigate(['/admin/users']); }
  goToBrokers() { this.router.navigate(['/admin/brokers']); }
  goToProperties() { this.router.navigate(['/admin/properties']); }
  goToReported() { this.router.navigate(['/admin/reported']); }

  // ================= LOGOUT =================

 logout() {

  const token = sessionStorage.getItem('token');

  this.http.put(
    'http://localhost:8000/api/auth/logout',
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  ).subscribe({
    next: () => {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    },
    error: () => {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  });
}
}