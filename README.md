# Casa - Bed Spacer Finder Application

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-Academic-blue)
![Ionic](https://img.shields.io/badge/Ionic-Framework-3880FF?logo=ionic&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)

## Repository Topics
`ionic` `postgresql` `bed-spacer-finder` `hybrid-mobile-app` `fullstack` `midterm-project` `capacitor`

---

Casa is a mobile-first web application designed to streamline the process of discovering and reserving affordable bed space listings. Developed as a midterm project using the Ionic Framework and a PostgreSQL database backend, Casa connects tenants with property owners through an intuitive, role-based platform.

## Technical Stack

* **Frontend Framework:** Ionic Framework (Capacitor)
* **Backend Database:** PostgreSQL
* **Design & Styling:** Custom CSS with Ionic UI Components
* **CI/CD Pipeline:** GitHub Actions (Automated Android APK Build)
* **Version Control:** Git & GitHub

## System Architecture and Features

### 1. Authentication and Authorization

* **Account Registration:** User registration with role designation (Tenant or Landlord).
* **Session Management:** Secure login authentication and access control based on user role.

### 2. Tenant Portal

* **Listing Exploration:** Browse available bed space listings with real-time availability and pricing.
* **Search & Filtering:** Search properties by geographic location and filter by price range or specific amenities.
* **Listing Details:** Access comprehensive property descriptions, house rules, listed amenities, and landlord contact details.
* **Mock Checkout System:** Simulated transaction processing supporting mock payment methods (GCash, Credit Card, Cash) without requiring live payment gateway integration.
* **Reservation Tracking:** View active, confirmed, and historical booking records.

### 3. Landlord Management Module

* **Listing CRUD Operations:** Create, read, update, and delete property listings.
* **Capacity Management:** Monitor and adjust available bed slots in real time.
* **Reservation Overview:** Track incoming tenant bookings and payment confirmation statuses.

## Database Schema (PostgreSQL)

The database model comprises three primary relational tables:

* `users`: Stores user credentials and account types (`id`, `name`, `email`, `password_hash`, `role`).
* `listings`: Contains property information (`id`, `landlord_id`, `title`, `description`, `price`, `location`, `slots_available`, `amenities`).
* `bookings`: Records reservation transactions (`id`, `tenant_id`, `listing_id`, `payment_status`, `created_at`).

## License

This project is developed for academic evaluation as a midterm course requirement.