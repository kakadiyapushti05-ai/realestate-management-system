import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.services';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profileImage?: string;
  isOnline?: boolean;
}

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.css']
})
export class AllUsersComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;

  searchText = '';
  statusFilter = 'all';
  sortOrder = 'newest';

  isBrowser = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,   // ✅ FIXED
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

 ngOnInit(): void {
  if (this.isBrowser) {
    this.loadUsers();

    // ✅ AUTO REFRESH EVERY 5 SEC
    setInterval(() => {
      this.loadUsers();
    }, 5000);
  }
}

  /* ================= BACK ================= */
  goBack() {
    this.router.navigate(['/admin']);
  }

  loadUsers() {
  this.loading = true;

  this.authService.getAllUsers().subscribe({

    next: (data: any[]) => {

      this.users = data.map(user => ({
        ...user,
        profileImage: user.profileImage
          ? user.profileImage.startsWith('http')
            ? user.profileImage
            : `http://localhost:8000/${user.profileImage}`
          : '',
        isOnline: !!user.isOnline   // ✅ FINAL FIX
      }));

      this.filteredUsers = this.users;
      this.loading = false;
    },

    error: (err: any) => {
      console.error(err);
      this.loading = false;
    }
  });
}
  /* ================= FILTER ================= */
  applyFilters() {
    let temp = [...this.users];

    if (this.searchText) {
      temp = temp.filter(user =>
        user.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      temp = temp.filter(user =>
        this.statusFilter === 'active'
          ? user.isOnline
          : !user.isOnline
      );
    }

    if (this.sortOrder === 'newest') {
      temp.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      temp.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    this.filteredUsers = temp;
  }

  sortUsers() {
    this.applyFilters();
  }

  /* ================= DELETE USER ================= */
  deleteUser(id: string) {

    if (!confirm("Are you sure you want to delete this user?")) return;

    this.authService.deleteUser(id).subscribe({
      next: () => {
        alert("User deleted ✅");
        this.loadUsers();
      },
      error: (err: any) => {
        console.error(err);
        alert("Delete failed ❌");
      }
    });
  }

  /* ================= LOGOUT ================= */
  logout() {

  const token = sessionStorage.getItem("token");

  if (!token) return;

  this.http.put(
    "http://localhost:8000/api/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  ).subscribe({
    next: () => {
      console.log("✅ Logout success");
      sessionStorage.clear();
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.log("❌ Logout error", err);
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  });
}
}