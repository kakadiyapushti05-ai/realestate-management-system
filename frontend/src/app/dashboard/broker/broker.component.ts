import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-broker',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.css']
})
export class BrokerComponent implements OnInit {

  broker: any = {};
  properties: any[] = [];

  apiUrl = "http://localhost:8000";

  showModal = false;

  editData: any = {
    name: '',
    email: '',
    contact: ''
  };

  selectedImage: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    const token = sessionStorage.getItem('token');

    // ✅ TOKEN CHECK
    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      return;
    }

    const userData = sessionStorage.getItem('user');

    if (userData) {

      this.broker = JSON.parse(userData);

      // ✅ IMAGE FIX
      if (this.broker.profileImage) {
        this.broker.profileImage =
          `${this.apiUrl}/${this.broker.profileImage}`;
      }

      this.loadBrokerProperties(this.broker._id);
    }
  }

  /* ================= MODAL ================= */

  openEditModal() {
    this.showModal = true;

    this.editData = {
      name: this.broker.name,
      email: this.broker.email,
      contact: this.broker.contact
    };
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelect(event: any) {
    this.selectedImage = event.target.files[0];
  }

  /* ================= UPDATE PROFILE ================= */

  updateProfile() {

    // ✅ FIXED (sessionStorage)
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      return;
    }

    const formData = new FormData();

    formData.append("name", this.editData.name || "");
    formData.append("email", this.editData.email || "");
    formData.append("contact", this.editData.contact || "");

    if (this.selectedImage) {
      formData.append("profileImage", this.selectedImage);
    }

    this.http.put(
      `${this.apiUrl}/api/auth/update-profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .subscribe({

      next: (res: any) => {

        alert("Profile Updated ✅");

        this.broker = res.user;

        // ✅ IMAGE FIX
        if (this.broker.profileImage) {
          this.broker.profileImage =
            `${this.apiUrl}/${this.broker.profileImage}`;
        }

        sessionStorage.setItem("user", JSON.stringify(this.broker));

        this.selectedImage = null;
        this.showModal = false;
      },

      error: (err) => {

        console.error(err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️");
          sessionStorage.clear();
          this.router.navigate(['/login']);
          return;
        }

        alert("Update Failed ❌");
      }
    });
  }

  /* ================= IMAGE ERROR ================= */

  onImageError(event: any) {
    event.target.src = "assets/images/user.png";
  }

  /* ================= LOAD PROPERTIES ================= */

  loadBrokerProperties(brokerId: any) {

    this.http.get<any>(`${this.apiUrl}/api/properties/broker/${brokerId}`)
      .subscribe({

        next: (res) => {

          this.properties = res.data || [];

          this.properties = this.properties.map((p: any) => ({
            ...p,
            image: p.images && p.images.length
              ? `${this.apiUrl}/uploads/${p.images[0]}`
              : "assets/images/p1.jpg"
          }));
        },

        error: (err) => {
          console.error("PROPERTY LOAD ERROR:", err);
        }
      });
  }

  /* ================= LOGOUT ================= */

  logout() {

    const token = sessionStorage.getItem('token');

    this.http.put(
      `${this.apiUrl}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
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