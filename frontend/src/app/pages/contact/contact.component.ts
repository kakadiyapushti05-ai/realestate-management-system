import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  successMessage = '';
  errorMessage = '';

  email = 'support@realestate.com';  

  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', Validators.required],
      message: ['', Validators.required]
    });

  }

  onSubmit() {
    if (this.contactForm.invalid) return;

    this.http.post('http://localhost:8000/api/contact', this.contactForm.value)
      .subscribe({
        next: () => {
          this.successMessage = "Message sent successfully!";
          this.errorMessage = '';
          this.contactForm.reset();
        },
        error: () => {
          this.errorMessage = "Something went wrong!";
          this.successMessage = '';
        }
      });
  }
}
