import { Routes } from '@angular/router';

export const routes: Routes = [

  // ===============================
  // 🌍 PUBLIC PAGES
  // ===============================
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component')
        .then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component')
        .then(m => m.ContactComponent)
  },

  // ===============================
  // 🔐 AUTH
  // ===============================
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component')
        .then(m => m.SignupComponent)
  },

  // ===============================
  // 👑 ADMIN DASHBOARD
  // ===============================
  {
    path: 'admin',
    loadComponent: () =>
      import('./dashboard/admin/admin.component')
        .then(m => m.AdminComponent),
    children: [

      // ✅ Default Admin Home (ONLY Welcome shows)
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./dashboard/admin/admin.component')
            .then(m => m.AdminComponent)
      },

      {
        path: 'brokers',
        loadComponent: () =>
          import('./dashboard/admin/pages/all-brokers/all-brokers.component')
            .then(m => m.AllBrokersComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./dashboard/admin/pages/all-users/all-users.component')
            .then(m => m.AllUsersComponent)
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./dashboard/admin/pages/all-properties/all-properties.component')
            .then(m => m.AllPropertiesComponent)
      },
     {
  path: 'reported',
  loadComponent: () =>
    import('./dashboard/admin/pages/reported-properties/reported-properties.component')
      .then(m => m.ReportedPropertiesComponent)
}
    ]
  },

  // BROKER DASHBOARD
// ===============================
// 🧑‍💼 BROKER DASHBOARD
// ===============================

{
  path: 'broker',
  loadComponent: () =>
    import('./dashboard/broker/broker.component')
      .then(m => m.BrokerComponent)
},

{
  path: 'broker/add-property',
  loadComponent: () =>
    import('./dashboard/broker/pages/add-property/add-property.component')
      .then(m => m.AddPropertyComponent)
},

{
  path: 'broker/update-property',
  loadComponent: () =>
    import('./dashboard/broker/pages/update-property-list/update-property-list.component')
      .then(m => m.UpdatePropertyListComponent)
},

{
  path: 'broker/update-property/:id',
  loadComponent: () =>
    import('./dashboard/broker/pages/update-property/update-property.component')
      .then(m => m.UpdatePropertyComponent)
},

{
  path: 'broker/inquiry-details',
  loadComponent: () =>
    import('./dashboard/broker/pages/inquiry-details/inquiry-details.component')
      .then(m => m.InquiryDetailsComponent)
},
  
  // USER DASHBOARD
  
  {
    path: 'user',
    loadComponent: () =>
      import('./dashboard/users/users.component')
        .then(m => m.UsersComponent)
  },

 {
  path: 'user/inquiry/:id',
  loadComponent: () =>
    import('./dashboard/users/pages/inquiry/inquiry.component')
      .then(m => m.InquiryComponent)
},

{
  path: 'user/my-inquiries',
  loadComponent: () =>
    import('./dashboard/users/pages/my-inquiries/my-inquiries.component')
      .then(m => m.MyInquiriesComponent)
},
  
  //  FALLBACK
 
  {
    path: '**',
    redirectTo: 'login'
  }
];
