import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  properties:any[] = [];
  filteredProperties:any[] = [];
  savedProperties:any[] = [];

  reportedIds:string[] = [];

  user:any = {};
  myInquiries:number = 0;

  editModal=false;

  editData:any={
    name:'',
    email:'',
    contact:''
  };

  selectedImage:any=null;

  activeFilter='all';

  searchText='';
  locationSearch='';
  selectedTypes:string[]=[];
  priceRange:number=100000000;
  bhk:number=0;

  currentImageIndex:{[key:string]:number}={};

  isBrowser=false;

  constructor(
    private http:HttpClient,
    private router:Router,
    @Inject(PLATFORM_ID) private platformId:Object
  ){
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {

    if(!this.isBrowser) return;

    const token = sessionStorage.getItem("token");

    if(!token){
      alert("Please login first ⚠️");
      this.router.navigate(['/login']);
      return;
    }

    this.loadSavedProperties();
    this.getUserProfile();
    this.getMyInquiries();
  }

  /* ================= PROFILE ================= */

  getUserProfile(){

    const token = sessionStorage.getItem("token");

    this.http.get<any>(
      "http://localhost:8000/api/auth/me",
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next:(res)=>{
        this.user=res;

        this.editData={
          name:res.name,
          email:res.email,
          contact:res.contact
        };

        this.getAllProperties();
      },
      error:(err)=> this.handleAuthError(err)
    });
  }

  openEditProfile(){
    this.editData={...this.user};
    this.editModal=true;
  }

  closeModal(){
    this.editModal=false;
  }

  updateProfile(){

    const token = sessionStorage.getItem("token");

    const formData = new FormData();

    formData.append("name", this.editData.name);
    formData.append("email", this.editData.email);
    formData.append("contact", this.editData.contact);

    if(this.selectedImage){
      formData.append("profileImage", this.selectedImage);
    }

    this.http.put(
      "http://localhost:8000/api/auth/update-profile",
      formData,
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next: (res:any)=>{
        this.user = res.user;
        this.editModal = false;
        alert("Profile Updated ✅");
      },
      error: ()=> alert("Update Failed ❌")
    });
  }

  onImageSelect(event:any){
    this.selectedImage = event.target.files[0];
  }

  /* ================= PROPERTIES ================= */

  getAllProperties(){

    const token = sessionStorage.getItem("token");

    this.http.get<any[]>(
      'http://localhost:8000/api/properties/all',
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next:(res)=>{

        const userId = this.user?._id;

        this.properties = res.filter((p:any)=>
          !(userId && p.reportedBy?.includes(userId))
        );

        this.filteredProperties = [...this.properties];
      },
      error:(err)=> this.handleAuthError(err)
    });
  }

  /* ================= INQUIRY ================= */

  getMyInquiries(){

    const token = sessionStorage.getItem("token");

    this.http.get<any[]>(
      "http://localhost:8000/api/inquiries/my",
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next:(res)=> this.myInquiries = res.length,
      error:()=> this.myInquiries = 0
    });
  }

  openInquiry(propertyId:string){
    this.router.navigate(['/user/inquiry', propertyId]);
  }

  openMyInquiries(){
    this.router.navigate(['/user/my-inquiries']);
  }

  /* ================= SAVE ================= */

  loadSavedProperties(){
    const data = sessionStorage.getItem('savedProperties');
    if(data){
      this.savedProperties = JSON.parse(data);
    }
  }

  toggleSave(property:any){

    const index=this.savedProperties.findIndex(p=>p._id===property._id);

    if(index>-1){
      this.savedProperties.splice(index,1);
    }else{
      this.savedProperties.push(property);
    }

    sessionStorage.setItem('savedProperties', JSON.stringify(this.savedProperties));
  }

  isSaved(property:any){
    return this.savedProperties.some(p=>p._id===property._id);
  }

  showSavedProperties(){
    this.filteredProperties=[...this.savedProperties];
  }

  /* ================= FILTER ================= */

  applyFilter(type:string){

    this.activeFilter = type;

    if(type === 'all'){
      this.filteredProperties = [...this.properties];
    } else {
      this.filteredProperties = this.properties.filter(
        p => p.propertyStatus === type
      );
    }
  }

  toggleType(type:string,event:any){

    if(event.target.checked){
      this.selectedTypes.push(type);
    }else{
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    }
  }

  applySidebarFilters(){

    this.filteredProperties = this.properties.filter((p:any)=>{

      return (
        (!this.locationSearch || p.city?.toLowerCase().includes(this.locationSearch.toLowerCase())) &&
        (this.selectedTypes.length === 0 || this.selectedTypes.includes(p.type)) &&
        (!this.priceRange || p.propertyprice <= this.priceRange) &&
        (!this.bhk || p.size >= this.bhk)
      );

    });
  }

  applyPriceFilter(event:any){

    const value = event.target.value;

    this.filteredProperties.sort((a,b)=>
      value === 'low'
        ? a.propertyprice - b.propertyprice
        : b.propertyprice - a.propertyprice
    );
  }

  searchProperty(){

    this.filteredProperties = this.properties.filter((p:any)=>
      p.propertyname?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  /* ================= IMAGE ================= */

  nextImage(propertyId:string,total:number){
    this.currentImageIndex[propertyId] =
      ((this.currentImageIndex[propertyId] || 0) + 1) % total;
  }

  prevImage(propertyId:string,total:number){
    this.currentImageIndex[propertyId] =
      ((this.currentImageIndex[propertyId] || 0) - 1 + total) % total;
  }

  /* ================= REPORT ================= */

  reportProperty(propertyId: string){

    const token = sessionStorage.getItem("token");

    this.http.post(
      `http://localhost:8000/api/properties/report/${propertyId}`,
      {},
      { headers:{ Authorization:`Bearer ${token}` } }
    )
    .subscribe({
      next: () => {

        this.reportedIds.push(propertyId);

        this.properties = this.properties.filter(p => p._id !== propertyId);
        this.filteredProperties = this.filteredProperties.filter(p => p._id !== propertyId);

        alert("Reported ✅");
      }
    });
  }

  /* ================= LOGOUT ================= */

  logout() {

  const token = sessionStorage.getItem("token");

  this.http.put(
    "http://localhost:8000/api/auth/logout",
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

  /* ================= ERROR ================= */

  handleAuthError(err:any){
    if(err.status === 401){
      alert("Session expired ⚠️");
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}