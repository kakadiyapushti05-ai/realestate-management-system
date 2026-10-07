import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-property.component.html',
  styleUrls: ['./update-property.component.css']
})
export class UpdatePropertyComponent implements OnInit {

  propertyId = '';
  isBrowser = false;

  propertyData = {
    propertyprice: '',
    propertyStatus: 'rent',
    description: ''
  };

  images: string[] = [];
  selectedImages: File[] = [];
  imagePreview: string[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    if (!this.isBrowser) return;

    this.propertyId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.propertyId) {
      this.router.navigate(['/broker/update-property']);
      return;
    }

    this.fetchProperty();
  }

  /* ================= GET PROPERTY ================= */

  fetchProperty() {

    this.http
      .get<any>(`http://localhost:8000/api/properties/${this.propertyId}`)
      .subscribe({
        next: (res) => {

          this.propertyData.propertyprice = res.propertyprice;
          this.propertyData.propertyStatus = res.propertyStatus;
          this.propertyData.description = res.description;

          this.images = res.images || [];
        },
        error: (err) => {
          console.error("❌ Fetch error:", err);
        }
      });
  }

  /* ================= SELECT IMAGE ================= */

  onImageChange(event: any) {

    const files = event.target.files;

    if (!files) return;

    this.selectedImages = [];
    this.imagePreview = [];

    for (let i = 0; i < files.length; i++) {

      const file = files[i];
      this.selectedImages.push(file);

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imagePreview.push(e.target.result);
      };

      reader.readAsDataURL(file);
    }
  }

  /* ================= REMOVE PREVIEW ================= */

  removePreview(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreview.splice(index, 1);
  }

  /* ================= DELETE OLD IMAGE ================= */

  deleteImage(index: number) {
    this.images.splice(index, 1);
  }

  /* ================= UPDATE PROPERTY ================= */

  updateProperty() {

    // 🔥 FIX: sessionStorage
    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️ Please login again");
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();

    formData.append('propertyprice', this.propertyData.propertyprice);
    formData.append('propertyStatus', this.propertyData.propertyStatus);
    formData.append('description', this.propertyData.description);

    // keep existing images
    formData.append('existingImages', JSON.stringify(this.images));

    // new images
    this.selectedImages.forEach(file => {
      formData.append('images', file);
    });

    this.http.put(
      `http://localhost:8000/api/properties/${this.propertyId}`,
      formData,
      { headers }
    ).subscribe({

      next: () => {

        alert("Property Updated ✅");
        this.router.navigate(['/broker/update-property']);
      },

      error: (err) => {

        console.error(err);

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

  /* ================= DELETE PROPERTY ================= */

  deleteProperty() {

    if (!confirm('Delete this property?')) return;

    const token = sessionStorage.getItem('token');

    if (!token) {
      alert("Session expired ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(
      `http://localhost:8000/api/properties/${this.propertyId}`,
      { headers }
    ).subscribe({

      next: () => {

        alert('Property Deleted ❌');
        this.router.navigate(['/broker/update-property']);
      },

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