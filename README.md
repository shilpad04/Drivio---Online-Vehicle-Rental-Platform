# 🚗 Drivio – Online Vehicle Rental Platform

Drivio is a full-stack **Online Vehicle Rental System** built using the **MERN stack** with a modern, responsive frontend powered by **React and Tailwind CSS**.

The platform supports end-to-end vehicle rental operations including vehicle discovery, booking management, secure payment processing, rental history tracking, user reviews, and administrative controls.

---

## 📌 Project Overview

Drivio connects three types of users through a role-based system:

- **Renters** can search vehicles, book rentals, make payments, view rental history, and leave reviews
- **Vehicle Owners** can list vehicles, manage bookings, and track rental activity
- **Administrators** can approve vehicles, manage users, monitor payments, moderate reviews, and handle support inquiries

The system is designed to reflect real-world rental workflows with secure authentication, automated booking lifecycle handling, and third-party service integrations.

---

## ✨ Core Features

### 🔐 User Authentication & Authorization
- Secure user registration and login using JWT authentication
- Role-based access control for Admin, Owner, and Renter roles
- Protected routes on both frontend and backend
- User profile management

---

### 🚙 Vehicle Listings
- Vehicle owners can list vehicles with detailed information:
  - Make, model, year
  - Price per day
  - Fuel type, category, and location
  - Description and images
- Image uploads handled using ImageKit
- Admin approval workflow for vehicle listings
- Only approved vehicles are visible to the public
- Search and filter vehicles by vehicle type, location, price range, category, and fuel type

---

### 📅 Booking Management
- Date-based vehicle booking with availability validation
- Calendar-based availability display to prevent double bookings
- Booking lifecycle management:
  - Active
  - Cancelled
  - Completed
- Renters can cancel or modify bookings within allowed conditions
- Owners and Admins can view booking details
- Automatic booking completion after the rental end date

---

### 📧 Email Notifications
- Booking confirmation notifications
- Booking cancellation notifications
- Booking completion notifications
- Review reminder emails
- Implemented using SendGrid

---

### 💳 Payment Processing
- Secure payment gateway integration using Razorpay
- Payment order creation and verification
- User payment history tracking
- Admin payment monitoring
- Invoice generation for completed payments

**Payment & Refund Handling (Test Mode Clarification)**

Razorpay is integrated in **test mode** for development and evaluation purposes:

- Razorpay does **not provide a refund UI in test mode**
- Because of this limitation:
  - A **confirmation popup** is shown to the Admin when initiating a refund
  - Refund status is **updated based on Razorpay’s response**, not via a custom refund UI
- Refund records are synced with Razorpay and reflected correctly in the system
- Net Banking simulates real success and failure responses

This approach follows Razorpay’s official test-mode limitations and ensures correct backend-driven refund state handling.  
The system is production-ready and can support full refund UI when switched to live mode.

---

### 📜 Rental History Tracking
- Rental history available for Renters, Vehicle Owners, and Admins
- Tracks vehicle details, booking duration, and user information
- Supports better monitoring and management of rental activity

---

### ⭐ Reviews & Ratings
- Renters can leave reviews only after completing a booking
- Vehicle-specific ratings and feedback
- Reviews displayed on vehicle detail pages
- Admin moderation features:
  - Hide or unhide reviews
  - Delete reviews

---

### 📊 Dashboards
- **Admin Dashboard**
  - Platform overview
  - User management
  - Vehicle approval
  - Booking and payment monitoring
  - Review moderation
  - Support inquiry handling
- **Owner Dashboard**
  - Vehicle listings
  - Booking insights
  - Rental history
- **Renter Dashboard**
  - Current bookings
  - Rental history
  - Payment history

---

### 📩 Support & Inquiry System
- Users can raise support inquiries
- Admins can reply to and close inquiries
- Inquiry responses are sent via email

---

## 🏗 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Integrations
- Razorpay – Payment Gateway
- ImageKit – Image Uploads
- SendGrid – Email Notifications

---

## 🔑 Environment Configuration

### Backend
```
PORT
MONGO_URI
JWT_SECRET

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET

IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_URL_ENDPOINT

SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

### Frontend
```
VITE_API_URL

VITE_IMAGEKIT_PUBLIC_KEY
VITE_IMAGEKIT_URL_ENDPOINT
```

---

## ▶️ Installation & Setup

### Clone the Repository
git clone https://github.com/shilpad04/Drivio---Online-Vehicle-Rental-Platform.git

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
2. Vehicle owner lists a vehicle (pending admin approval)
3. Admin approves the vehicle
4. Vehicle becomes publicly available
5. Renter searches and books a vehicle
6. Payment is processed through Razorpay
7. Booking confirmation email is sent
8. Booking is automatically completed after the end date
9. Review reminder email is sent
10. Renter submits a review
11. Admin moderates reviews if required

---

## 🔒 Security Measures
- JWT-based authentication
- Role-based route protection
- Secure payment verification
- Server-side validation

---

## ⚠️ Development & Test Mode Disclaimer
- Payment gateway operates in test mode
- No real money is charged
- Refund UI is limited by Razorpay test-mode constraints
- Designed for safe evaluation and demonstration
- Reflects real-world production workflows

---

## 🔐 Demo Admin Credentials

For evaluation purposes:

- **Email:** admin@test.com  
- **Password:** admin123  

These credentials provide access to the Admin Dashboard for reviewing all platform features.

**Note:** These credentials are strictly for demonstration and evaluation only.

