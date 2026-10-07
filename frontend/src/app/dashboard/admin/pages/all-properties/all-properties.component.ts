import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './all-properties.component.html',
  styleUrls: ['./all-properties.component.css']
})
export class AllPropertiesComponent implements OnInit {

  properties:any[] = [];
  filteredProperties:any[] = [];

  cities: string[] = [];

  searchText = '';
  selectedCity = '';
  selectedStatus = 'all';
  verifiedFilter = 'all';
  sortPrice = '';

  currentImageIndex:{[key:string]:number} = {};

  isBrowser = false;

  constructor(
    private http:HttpClient,
    private router:Router,
    @Inject(PLATFORM_ID) private platformId:Object
  ){
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if(this.isBrowser){
      this.getAllProperties();
    }
  }

  /* ================= GET PROPERTIES ================= */

  getAllProperties(){

    // ✅ UPDATED: localStorage → sessionStorage
    const token = sessionStorage.getItem("token");

    this.http.get<any[]>(
      'http://localhost:8000/api/properties/all',
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next:(res)=>{
        this.properties = res;
        this.filteredProperties = [...res];

        // AUTO EXTRACT UNIQUE CITIES
        this.cities = [...new Set(
          res.map(p => p.city).filter(c => c)
        )];
      },
      error:(err)=>{
        console.error("❌ Error:", err);
      }
    });
  }

  /* ================= FILTER ================= */

  applyFilters(){

    let temp = [...this.properties];

    // search
    if(this.searchText){
      temp = temp.filter(p =>
        p.propertyname?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // city
    if(this.selectedCity){
      temp = temp.filter(p =>
        p.city === this.selectedCity
      );
    }

    // status
    if(this.selectedStatus !== 'all'){
      temp = temp.filter(p => p.propertyStatus === this.selectedStatus);
    }

    // verified
    if(this.verifiedFilter !== 'all'){
      temp = temp.filter(p =>
        this.verifiedFilter === 'verified'
          ? p.isVerified
          : !p.isVerified
      );
    }

    // price sort
    if(this.sortPrice){
      temp.sort((a,b)=>
        this.sortPrice === 'low'
        ? a.propertyprice - b.propertyprice
        : b.propertyprice - a.propertyprice
      );
    }

    this.filteredProperties = temp;
  }

  /* ================= IMAGE ================= */

  nextImage(id:string,total:number){
    this.currentImageIndex[id] =
      ((this.currentImageIndex[id] || 0) + 1) % total;
  }

  prevImage(id:string,total:number){
    this.currentImageIndex[id] =
      ((this.currentImageIndex[id] || 0) - 1 + total) % total;
  }

  goBack(){
    this.router.navigate(['/admin']);
  }

}