# 🏠 Real Estate Management System

A full-stack Real Estate Management System built using Angular, Node.js, Express.js and MongoDB.

The system provides a complete platform for users, brokers and administrators to manage properties, listings, inquiries and reports with role-based access control.

---

## 📌 About The Project

The Real Estate Management System is designed to make property buying, renting and management easier through a centralized web application.

The system provides different functionalities based on user roles:

- 👤 User
- 🏢 Broker
- 🛡️ Admin

Users can search and filter properties, view property details, save properties to their wishlist and send inquiries.

Brokers can create and manage property listings and handle user inquiries.

Administrators can manage users, brokers, properties and reported properties from the admin dashboard.

---

## ✨ Key Features

### 👤 User

- User Registration & Login
- JWT Authentication
- Profile Management
- Search Properties
- Property Filtering
- View Property Details
- Wishlist
- Send Property Inquiry
- Property Visit Request
- Report Property

### 🏢 Broker

- Broker Registration & Login
- Broker Profile
- Add Property
- Update Property
- Delete Property
- Manage Property Listings
- Rent / Sale Properties
- Mark Property as Sold
- Manage Property Images
- View User Inquiries

### 🛡️ Admin

- Admin Dashboard
- User Management
- Broker Management
- Property Management
- Property Reports
- Report Resolution
- Delete Reported Properties
- Dashboard Statistics
- Charts & Analytics

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| Angular | Frontend |
| TypeScript | Frontend Programming |
| HTML5 | Structure |
| CSS3 | Styling |
| Node.js | Backend Runtime |
| Express.js | REST API |
| MongoDB | Database |
| JWT | Authentication |
| Multer | File Upload |
| Git | Version Control |
| GitHub | Repository |
| Postman | API Testing |

---

## 🏗️ System Architecture

```text
                 Real Estate Management System
                            │
             ┌──────────────┼──────────────┐
             │              │              │
            User          Broker          Admin
             │              │              │
             └──────────────┼──────────────┘
                            │
                     Angular Frontend
                            │
                       REST API
                            │
                   Node.js + Express.js
                            │
                         MongoDB