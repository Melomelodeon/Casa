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

## Local Supabase setup

Registration uses Supabase Authentication. Copy `.env.example` to `.env` and set:

* `VITE_SUPABASE_URL` to the project URL from Supabase Settings > API.
* `VITE_SUPABASE_ANON_KEY` to the project’s publishable/anon key from Supabase Settings > API.

The signup form stores the selected account type and full name in the new Auth user’s metadata as `role` and `full_name`. If email confirmation is enabled in Supabase, users must confirm their email before signing in.

Run [`supabase/spaces.sql`](./supabase/spaces.sql) in the Supabase SQL Editor to create the listing hierarchy, access policies, photo bucket, and listing coordinate columns. Re-run it on existing deployments to add the coordinate columns. Running [`supabase/sample_spaces.sql`](./supabase/sample_spaces.sql) adds 15 sample listings and their related floors, rooms, and bedspaces across existing landlord accounts without deleting existing data. Re-running it skips listings with matching names and locations. Run [`supabase/bookings.sql`](./supabase/bookings.sql) to create or upgrade booking records and enable booking requests. Hosts can end an approved tenancy from the Requests page; this marks the booking completed and releases that bed or room. A signed-in user is required before checkout. The selected room or bed is reserved when the user presses Pay; the receipt then redirects to the final booking confirmation when tapped or after its 10-second timer.

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

The listing database model uses four related tables:

* `spaces`: Host-owned listing details, monthly starting rent, and cover photo.
* `floors`: Floor name and optional photo for a space.
* `rooms`: Room details, layout grid, private-room amenities/rules, and optional rent.
* `bedspaces`: Per-bed rent, grid position, amenities, rules, maintenance history, and optional photo.

Authentication credentials remain in Supabase Auth. `bookings` records reservation transactions (`tenant_id`, `listing_id`, `payment_status`, `created_at`).

## License

This project is developed for academic evaluation as a midterm course requirement.