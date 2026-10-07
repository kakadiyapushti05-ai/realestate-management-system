import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  user = {
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  selectedImage: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  register() {

    if (
      !this.user.name ||
      !this.user.email ||
      !this.user.contact ||
      !this.user.password ||
      !this.user.confirmPassword ||
      !this.user.role
    ) {
      alert("All fields are required!");
      return;
    }

    const contactPattern = /^[0-9]{10}$/;
    if (!contactPattern.test(this.user.contact)) {
      alert("Contact must be 10 digits!");
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert("Password and Confirm Password do not match!");
      return;
    }

    const formData = new FormData();

    formData.append("name", this.user.name);
    formData.append("email", this.user.email);
    formData.append("contact", this.user.contact);
    formData.append("password", this.user.password);
    formData.append("confirmPassword", this.user.confirmPassword);
    formData.append("role", this.user.role);

    if (this.selectedImage) {
      formData.append("profileImage", this.selectedImage);
    }

    this.http.post('http://localhost:8000/api/auth/signup', formData)
      .subscribe({
        next: (res: any) => {
          alert(res.message || "Signup successful");
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          alert(err.error?.message || "Server error");
          console.error(err);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
