# 🚗 Drivio – Online Vehicle Rental Platform

Drivio is a full-stack **Online Vehicle Rental System** built using the **MERN stack**.  
It provides a complete solution for vehicle listings, booking management, secure payment processing, rental history tracking, user reviews, and admin control.

This project is designed to support **real-world vehicle rental operations** with role-based access, automated workflows, and email notifications.

---

## 📌 Project Overview

The platform connects **Renters**, **Vehicle Owners**, and **Administrators**:

- Renters can browse vehicles, book rentals, make payments, and leave reviews
- Vehicle Owners can list vehicles and manage bookings
- Administrators manage users, vehicles, payments, reviews, and support inquiries

The system includes **real payment gateway integration**, **email notifications**, and **analytics dashboards**.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN / OWNER / RENTER)
- Protected routes on frontend and backend
- User profile management

---

### 🚙 Vehicle Listings
- Add, update, and manage vehicle listings
- Vehicle details include make, model, price per day, and images
- Image uploads using ImageKit
- Admin approval and rejection of vehicle listings
- Public visibility only for approved vehicles
- Search and filter vehicles by various criteria

---

### 📅 Booking Management
- Date-based vehicle booking
- Prevention of overlapping / double bookings
- Booking lifecycle management:
  - Active
  - Cancelled
  - Completed
- Users can cancel bookings
- Owners and Admins can view bookings
- Automatic booking completion after end date

---

### 📧 Email Notifications
- Booking confirmation email
- Booking cancellation email
- Booking completion email
- Review reminder email
- Inquiry reply email
- Implemented using SendGrid

---

### 💳 Payment Processing
- Razorpay payment gateway integration
- Secure payment order creation and verification
- User payment history
- Admin payment monitoring
- Invoice generation for completed payments

---

### 📜 Rental History Tracking
- Rental history for Renters
- Rental history for Vehicle Owners
- Rental history for Admins
- Tracks booking duration, vehicle, and user details
- Role-based access to history data

---

### ⭐ Reviews & Ratings
- Users can leave reviews only after completed bookings
- Vehicle-specific reviews and ratings
- Reviews displayed on vehicle details pages
- Admin moderation:
  - Hide reviews
  - Unhide reviews
  - Delete reviews

---

### 📊 Dashboards & Analytics
- Admin dashboard with platform overview
- Owner dashboard with vehicle and booking insights
- Renter dashboard with booking and payment overview

---

### 📩 Support & Inquiry System
- Users can raise support inquiries
- Admin can reply to inquiries
- Admin can close inquiries
- Inquiry replies sent via email

---

## 🏗 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Integrations
- Razorpay (Payments)
- ImageKit (Image uploads)
- SendGrid (Email notifications)

---

## 📁 Project Structure

### Backend (`server`)
- **config**
  - db.js
  - imagekit.js
- **controllers**
  - adminUserController.js
  - analyticsController.js
  - authController.js
  - bookingController.js
  - bookingViewController.js
  - historyController.js
  - imagekitController.js
  - inquiryController.js
  - paymentController.js
  - reviewController.js
  - userController.js
  - vehicleController.js
- **middleware**
  - auth.js
  - authorizeRoles.js
- **models**
  - Booking.js
  - Inquiry.js
  - Payment.js
  - Review.js
  - User.js
  - Vehicle.js
- **routes**
  - adminUserRoutes.js
  - analyticsRoutes.js
  - authRoutes.js
  - bookingRoutes.js
  - bookingViewRoutes.js
  - historyRoutes.js
  - imagekitRoutes.js
  - inquiryRoutes.js
  - paymentRoutes.js
  - reviewRoutes.js
  - userRoutes.js
  - vehicleRoutes.js
- **services**
  - emailService.js
- **utils**
  - autoCompleteExpiredBookings.js
- server.js
- package.json

---

### Frontend (`client`)
- **public**
- **src**
  - **api**
    - authApi.js
    - availabilityApi.js
    - axios.js
    - imagekitApi.js
    - payment.js
    - reviewApi.js
    - vehicleApi.js
  - **assets**
  - **components**
    - AnalyticsCard.jsx
    - AuthModal.jsx
    - ConfirmModal.jsx
    - DashboardTile.jsx
    - FilterBar.jsx
    - Footer.jsx
    - ImageUpload.jsx
    - InvoiceModal.jsx
    - Navbar.jsx
    - ProtectedRoute.jsx
    - Reviews.jsx
    - StatusBadge.jsx
    - VehicleCard.jsx
  - **context**
    - AuthContext.jsx
  - **pages**
    - **dashboard**
      - AdminDashboard.jsx
      - AdminInquiries.jsx
      - AdminReviews.jsx
      - AdminUserDetails.jsx
      - AdminUsers.jsx
      - OwnerDashboard.jsx
      - OwnerReviews.jsx
      - RenterDashboard.jsx
    - About.jsx
    - AddVehicle.jsx
    - Contact.jsx
    - HowItWorks.jsx
    - Landing.jsx
    - Payments.jsx
    - RentalHistory.jsx
    - UserProfile.jsx
    - VehicleAvailability.jsx
    - VehicleBookings.jsx
    - VehicleDetails.jsx
    - Vehicles.jsx
  - **utils**
    - exportCSV.js
    - pagination.js
  - App.jsx
  - main.jsx
  - index.css
  - App.css
- package.json
- vite.config.js

---

## 🔑 Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api

VITE_IMAGEKIT_PUBLIC_KEY=
VITE_IMAGEKIT_URL_ENDPOINT=
```

---

## ▶️ Installation & Setup

### Clone Repository
```
git clone https://github.com/shilpad04/Drivio---Online-Vehicle-Rental-Platform.git
```

### Backend Setup
```
cd server
npm install
npm run dev
```

### Frontend Setup
```
cd client
npm install
npm run dev
```

---

## 🔄 Application Flow

1. User registers and logs in
2. Owner lists a vehicle (pending admin approval)
3. Admin approves the vehicle
4. Vehicle becomes publicly available
5. Renter books the vehicle for selected dates
6. Payment is processed using Razorpay
7. Booking confirmation email is sent
8. Booking is automatically completed after end date
9. Review reminder email is sent
10. User submits a review
11. Admin moderates reviews if required

---

## 🔒 Security

- JWT authentication middleware
- Role-based route protection
- Secure payment verification
- Server-side validations

---


