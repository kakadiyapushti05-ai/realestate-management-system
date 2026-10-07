import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.services';
import { Router } from '@angular/router';

interface Broker {
  _id?: string;
  name: string;
  email: string;
  createdAt?: string;
  profileImage?: string;
  isOnline?: boolean;
}

@Component({
  selector: 'app-all-brokers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-brokers.component.html',
  styleUrls: ['./all-brokers.component.css']
})
export class AllBrokersComponent implements OnInit {

  brokers: Broker[] = [];
  filteredBrokers: Broker[] = [];
  loading = true;

  searchText = '';
  sortOrder = 'newest';
  statusFilter = 'all';

  isBrowser = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadBrokers();
    }
  }

  /* 🔙 BACK FUNCTION */
  goBack() {
    this.router.navigate(['/admin']);
  }

  /* ================= LOAD BROKERS ================= */

  loadBrokers(): void {
    this.authService.getAllBrokers().subscribe({
      next: (data: Broker[]) => {

        this.brokers = data.map(b => ({
          ...b,

          profileImage: b.profileImage
            ? b.profileImage.startsWith('http')
              ? b.profileImage
              : `http://localhost:8000/${b.profileImage}`
            : '',

          isOnline: b.isOnline === true,

          createdAt: b.createdAt || new Date().toISOString()
        }));

        this.applyFilters();
        this.loading = false;
      },

      error: (err: any) => {

        if (err.status === 401 && this.isBrowser) {
          alert("Unauthorized! Please login as admin ⚠️");

          // 🔥 FIX: localStorage → sessionStorage
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');

          this.router.navigate(['/login']);
        }

        console.error('Failed to load brokers', err);
        this.loading = false;
      }
    });
  }

  /* ================= FILTER ================= */

  applyFilters() {
    let temp = [...this.brokers];

    // 🔍 SEARCH
    if (this.searchText) {
      temp = temp.filter(b =>
        b.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // 🟢 STATUS FILTER
    if (this.statusFilter !== 'all') {
      temp = temp.filter(b =>
        this.statusFilter === 'active'
          ? b.isOnline
          : !b.isOnline
      );
    }

    // 📅 SORT
    temp.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return this.sortOrder === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    });

    this.filteredBrokers = temp;
  }

  sortUsers() {
    this.applyFilters();
  }

  /* ================= DELETE ================= */

  deleteBroker(id: string) {

    if (!confirm("Are you sure you want to delete this broker?")) return;

    this.authService.deleteUser(id).subscribe({
      next: () => {
        alert("Broker deleted ✅");
        this.loadBrokers(); // refresh
      },
      error: (err) => {
        console.error(err);
        alert("Delete failed ❌");
      }
    });

  }

}