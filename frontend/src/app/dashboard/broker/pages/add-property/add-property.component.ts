import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  property = {
    propertyname: '',
    propertyprice: '',
    size: '',
    floor: '',
    city: '',
    area: '',
    type: '',
    propertyStatus: '',
    description: ''
  };

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  apiUrl = "http://localhost:8000";

  /* ================= NAV ================= */

  goDashboard() {
    this.router.navigate(['/broker']);
  }

  /* ================= FILE ================= */

  onFileChange(event: any) {

    const files = Array.from(event.target.files);

    files.forEach((file: any) => {

      this.selectedFiles.push(file);

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };

      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  /* ================= SUBMIT ================= */

  submit() {

    const formData = new FormData();

    Object.entries(this.property).forEach(([key, value]) => {
      formData.append(key, value ? value.toString() : '');
    });

    this.selectedFiles.forEach(file => {
      formData.append("images", file);
    });

    // 🔥 FIX: localStorage → sessionStorage
    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem("token")
      : null;

    if (!token) {
      alert("❌ Session expired. Please login again");
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post(
      `${this.apiUrl}/api/properties/add`,
      formData,
      { headers }
    ).subscribe({

      next: () => {
        alert("✅ Property Added Successfully");
        this.router.navigate(['/broker']);
      },

      error: (err) => {

        console.error("❌ ERROR:", err);

        if (err.status === 401 || err.status === 403) {
          alert("Session expired ⚠️ Please login again");
          sessionStorage.clear();
          this.router.navigate(['/login']);
          return;
        }

        alert(err?.error?.message || "Something went wrong ❌");
      }
    });
  }
}