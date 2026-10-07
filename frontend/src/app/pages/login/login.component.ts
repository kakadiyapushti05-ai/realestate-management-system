import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  data = {
    email: '',
    password: ''
  };

  loading = false;

  // 🔥 FORGOT PASSWORD
  showForgot = false;
  otp = '';
  newPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /* ================= LOGIN ================= */
  login() {

    if (!this.data.email || !this.data.password) {
      alert('Please enter email and password');
      return;
    }

    this.loading = true;

    this.auth.login(this.data).subscribe({

      next: (res: any) => {

        if (!res?.token) {
          alert('Login failed ❌');
          this.loading = false;
          return;
        }

        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user?.role;

        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'broker') {
          this.router.navigate(['/broker']);
        } else {
          this.router.navigate(['/user']);
        }

        this.loading = false;
      },

      error: (err: any) => {
        alert(err?.error?.message || 'Login failed ❌');
        this.loading = false;
      }
    });
  }

  /* ================= SIGNUP ================= */
  goToSignup() {
    this.router.navigate(['/signup']);
  }

  /* ================= FORGOT PASSWORD ================= */

  openForgot(){
    if(!this.data.email){
      alert("Enter email first ❗");
      return;
    }

    // 🔥 SEND OTP
    this.auth.sendOTP({ email: this.data.email }).subscribe({
      next: () => {
        alert("OTP sent to your email 📩");
        this.showForgot = true;
      },
      error: () => {
        alert("Failed to send OTP ❌");
      }
    });
  }

  closeForgot(){
    this.showForgot = false;
    this.otp = '';
    this.newPassword = '';
  }

  /* ================= VERIFY OTP ================= */

  resetPassword(){

    if(!this.otp || !this.newPassword){
      alert("Enter OTP & new password ❗");
      return;
    }

    this.auth.verifyOTP({
      email: this.data.email,
      otp: this.otp,
      newPassword: this.newPassword
    })
    .subscribe({

      next:()=>{
        alert("Password updated successfully ✅");
        this.closeForgot();
      },

      error:(err:any)=>{
        alert(err?.error?.message || "Invalid OTP ❌");
      }

    });
  }
}