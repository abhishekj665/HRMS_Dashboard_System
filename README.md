# Multi-Organization HRMS Dashboard System

HRMS Dashboard System is a full-stack Human Resource Management platform for handling employee operations, attendance, leave workflows, expenses, assets, and recruitment from a single dashboard. It is built as a monorepo with a React frontend and a Node.js + Express backend backed by MySQL through Sequelize.

The platform now supports a multi-organization architecture, allowing multiple companies to operate independently within the same application. Each organization has its own admin, users, policies, dashboards, and operational records, with tenant-aware isolation enforced across the backend, database layer, and realtime communication.

This repository is focused on practical, production-style HR workflows:

- secure authentication with OTP verification
- role-based dashboards for admin, manager, and employee users
- multi-organization onboarding with tenant-scoped data separation
- attendance monitoring and attendance policy management
- leave policy, leave balance, and leave approval workflows
- asset allocation and request handling
- expense submission and approval
- recruitment pipelines from requisition to offer
- realtime request updates using SocketIO

## Default Credentials

For testing purposes, the following default user accounts are available:

### Admin

- Email: `admin@orvane.com`
- Password: `Admin@123`

### Manager

- Email: `manager@orvane.com`
- Password: `Manager@123`

### Employee

- Email: `employee@orvane.com`
- Password: `Employee@123`

### Organization Registration Default

When a new organization is registered through the organization onboarding flow, the current service creates the initial organization admin with the default password:

- Password: `Admin@123`

## Table of Contents

- [Project Overview](#project-overview)
- [Key Capabilities](#key-capabilities)
- [Multi-Organization Architecture](#multi-organization-architecture)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Frontend Routes](#frontend-routes)
- [Backend Modules](#backend-modules)
- [API Summary](#api-summary)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Available Scripts](#available-scripts)
- [Authentication and Security](#authentication-and-security)
- [Realtime Communication](#realtime-communication)
- [Deployment Notes](#deployment-notes)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Conclusion](#conclusion)

## Project Overview

The HRMS Dashboard System centralizes internal HR operations that are usually spread across spreadsheets, email chains, and disconnected tools. The application provides one place to manage workforce activity and operational HR processes.

The codebase is split into:

- `client/` for the web dashboard and public career pages
- `server/` for the REST API, business logic, realtime events, and database layer

The system currently includes modules for:

- authentication
- organization registration and onboarding
- employee and manager management
- attendance and attendance-policy administration
- leave management system
- asset request workflows
- expense workflows
- recruitment management

## Key Capabilities

### Organization Management

- register a new organization from a public onboarding flow
- create the first admin user during organization registration
- maintain organization profile and legal information
- support isolated organization-level dashboards and operations

### Authentication and Session Management

- user signup with OTP verification
- login with JWT-based cookie session
- logout and current-user session check
- role-protected routes for admin, manager, and user access

### Employee Administration

- register users and managers
- assign workers to managers
- block or unblock users
- track login IP activity
- block or unblock suspicious IPs

### Attendance Management

- store attendance data
- create and process attendance requests
- support attendance approvals and rejections
- configure organization-level attendance policies
- maintain overtime and attendance-related models

### Leave Management System

- define leave types
- define leave policies
- assign leave policies
- track leave balances
- apply for leave
- approve or reject leave requests

### Asset and Expense Workflows

- manage asset inventory
- request assets
- approve or reject asset requests
- submit expenses
- approve or reject expense entries

### Recruitment Management

- create job requisitions
- publish job postings
- manage candidate records
- receive applications
- schedule and track interviews
- collect interview feedback
- move candidates across hiring stages
- generate and accept offers

### Public Careers Experience

- list open jobs
- view organization-specific job details
- submit job applications
- review and accept offers through tokenized links

## Multi-Organization Architecture

The platform is now structured as a multi-tenant HRMS system.

### What This Means

- each organization is created through `/organization/register`
- the registering admin is attached to that organization as its tenant owner
- major business entities carry `tenantId` for data isolation
- tenant-aware helpers such as `requireTenantId`, `getScopedWhere`, and `assertSameTenant` are used across services
- public recruitment routes support organization-aware career pages using organization slug-based URLs
- Socket.IO rooms are tenant-aware for admin, manager, and user notifications

### Tenant-Aware Modules

The current backend structure shows organization-aware relationships across:

- users and managers
- attendance and attendance policies
- leave requests, leave balances, leave types, and leave policies
- assets and asset requests
- expenses
- recruitment entities such as job postings, candidates, interviews, offers, and applications

This design allows the same application instance to support multiple organizations without mixing HR, leave, attendance, asset, expense, or recruitment records across tenants.

## User Roles

### Admin

Admins have the highest level of operational control in the system for their own organization. They can manage users, managers, attendance policies, leave settings, IP restrictions, requests, expenses, assets, and recruitment workflows.

### Manager

Managers can supervise team-level operations including users assigned to them, attendance review, leave request decisions, asset requests, expenses, and recruitment-related responsibilities.

### User

Standard users can access their own attendance, leave, assets, expenses, and profile/account-related flows.

### Candidate

Candidates interact with the public-facing careers and offer pages without needing access to the internal dashboard.

## Tech Stack

### Frontend

- React 19
- Vite
- Material UI
- Redux Toolkit
- Redux Persist
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS
- Day.js

### Backend

- Node.js
- Express
- Sequelize ORM
- MySQL
- Joi validation
- JWT
- Cookie Parser
- CORS
- Socket.IO
- Nodemailer
- Brevo API integration
- Cloudinary

## System Architecture

The backend follows a modular layered architecture.

```text
Client UI
  -> Route components
  -> Frontend service layer
  -> REST API / Socket.IO
  -> Express routes
  -> Controllers
  -> Services
  -> Sequelize models
  -> MySQL database
```

### Backend Layer Responsibilities

- `routes/` define API endpoints and mount domain modules
- `controllers/` receive requests and shape responses
- `services/` contain business logic
- `models/` define entities and relationships
- `middlewares/` handle auth, validation, and error flow
- `utils/` provide helpers for tenant scoping, JWT, mail templates, geo lookup, PDF generation, socket room generation, and response formatting

### Architectural Highlights

- clear separation of concerns
- role-based routing and middleware
- modular domain organization
- reusable service layer
- multi-organization tenant isolation
- realtime event delivery with Socket.IO

## Folder Structure

```text
Authentication_Security/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   |   |-- AdminPages/
|   |   |   |-- Auth/
|   |   |   |-- CareerPages/
|   |   |   |-- ManagerPages/
|   |   |   |-- UserPages/
|   |   |   \-- organization/
|   |   |-- redux/
|   |   |-- services/
|   |   |-- store/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   \-- socket.js
|   |-- package.json
|   \-- vite.config.js
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- constants/
|   |   |-- controllers/
|   |   |   |-- admin/
|   |   |   |-- attendance/
|   |   |   |-- LMS/
|   |   |   |-- manager/
|   |   |   |-- organization/
|   |   |   |-- recruitment/
|   |   |   \-- user/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |   |-- AssetModels/
|   |   |   |-- AttendanceModels/
|   |   |   |-- LeaveModels/
|   |   |   |-- Organizations/
|   |   |   |-- RecruitmentModels/
|   |   |   \-- UserModels/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- validators/
|   |   |-- app.js
|   |   \-- server.js
|   \-- package.json
\-- README.md
```

### Important Frontend Areas

- `client/src/pages/Auth/` authentication pages
- `client/src/pages/AdminPages/` admin dashboard modules
- `client/src/pages/ManagerPages/` manager dashboard modules
- `client/src/pages/UserPages/` employee dashboard modules
- `client/src/pages/CareerPages/` public recruitment pages
- `client/src/pages/organization/` organization onboarding flow
- `client/src/services/` API integrations grouped by domain

### Important Backend Areas

- `server/src/config/` environment, database, OTP, and cloud configuration
- `server/src/routes/` API route groups
- `server/src/controllers/` HTTP request handlers
- `server/src/services/` domain logic
- `server/src/models/` Sequelize schema definitions
- `server/src/middlewares/` auth and validation middleware
- `server/src/utils/tenant.utils.js` tenant-scoping utilities

## Frontend Routes

The frontend uses React Router and currently exposes major screens such as:

### Public Routes

- `/`
- `/login`
- `/organization/register`
- `/careers`
- `/careers/:orgSlug/:slug`
- `/careers/:orgSlug/:slug/apply`
- `/offer/:token`

### User Dashboard

- `/home/asset`
- `/home/expense`
- `/home/attendance`
- `/home/leave-management`

### Admin Dashboard

- `/admin/dashboard`
- `/admin/ips`
- `/admin/requests`
- `/admin/asset`
- `/admin/expenses`
- `/admin/manager`
- `/admin/attendance-policy`
- `/admin/attendance`
- `/admin/leave-requests`
- `/admin/leave-policy`
- `/admin/leave-type`
- `/admin/job-requisition`
- `/admin/job-posts`
- `/admin/job-applications`

### Manager Dashboard

- `/manager/dashboard/assets`
- `/manager/dashboard/users`
- `/manager/dashboard/requests`
- `/manager/dashboard/attendance/request`
- `/manager/dashboard/attendance/me`
- `/manager/dashboard/expenses`
- `/manager/dashboard/leave-requests`
- `/manager/dashboard/job-requisition`
- `/manager/dashboard/leave/management`
- `/manager/dashboard/interviews`

## Backend Modules

Major backend route groups mounted in `server/src/app.js`:

- `/auth`
- `/users`
- `/admin`
- `/manager`
- `/account`
- `/attendance`
- `/attendance-policy`
- `/lms`
- `/recruitment`
- `/organization`

### Module Breakdown

#### Auth Module

Handles signup, login, OTP verification, logout, and session inspection.

#### User Module

Handles authenticated user operations such as assets, expenses, attendance, leave access, and user information.

#### Admin Module

Handles organization-wide management flows including users, managers, assets, attendance, expenses, leave requests, and recruitment management for the current tenant.

#### Manager Module

Handles team-level workflows such as employee oversight, requests, expenses, attendance, leave actions, and selected recruitment workflows.

#### LMS Module

Handles leave balances, leave types, leave policies, and leave-related workflows.

#### Recruitment Module

Handles requisitions, job postings, applications, candidates, interviews, interview feedback, stage progression, and offers.

#### Organization Module

Handles public organization registration and onboarding.

## API Summary

This section is intentionally high-level so a visitor can understand the shape of the system quickly.

### Authentication Endpoints

Base path: `/auth`

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/verify`
- `POST /auth/logout`
- `GET /auth/me`

### Organization Endpoints

Base path: `/organization`

- `POST /organization/register`

### Attendance Policy Endpoints

Base path: `/attendance-policy`

- `POST /attendance-policy/`
- `GET /attendance-policy/`
- `GET /attendance-policy/all`
- `PUT /attendance-policy/:id`
- `DELETE /attendance-policy/:id`

### User-Facing Examples

Base path: `/users`

- attendance data
- expense submission and updates
- asset visibility
- leave application and leave balance lookup

### Admin-Facing Examples

Base path: `/admin`

- user registration and listing
- manager registration and assignment
- IP blocking and unblocking
- asset CRUD
- request approvals
- expense approvals
- attendance approvals
- leave request decisions

### Manager-Facing Examples

Base path: `/manager`

- team user management
- asset request review
- expense review
- attendance review
- leave request approval or rejection

### Recruitment Examples

Base path: `/recruitment`

- requisition creation and approval
- job post creation and publishing
- public jobs listing
- application submission
- interview scheduling
- interview feedback
- offer generation
- offer acceptance

## Environment Variables

### Server `.env`

The backend reads the following environment variables from `server/src/config/env.js`:

```env
PORT=5000
SECRET=your_app_secret
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrms_dashboard
JWT_PASSWORD=your_jwt_secret
MAIL_USER=your_email
MAIL_PASS=your_email_password
GEO_API_KEY=your_geo_api_key
CLOUD_NAME=your_cloudinary_name
CLOUD_KEY=your_cloudinary_key
CLOUD_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
BREVO_API_KEY=your_brevo_api_key
OFFER_URL=http://localhost:5173/offer
```

### Client `.env`

The frontend expects:

```env
VITE_BASE_URL=http://localhost:5000
```

## Local Development Setup

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- MySQL database instance

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Run Backend

```bash
cd server
npm run dev
```

### Run Frontend

In a separate terminal:

```bash
cd client
npm run dev
```

### Multi-Organization Flow to Test

1. Start the backend and frontend locally.
2. Open `/organization/register` to create a new organization.
3. Use the generated admin account to log in.
4. Create managers and employees under that organization.
5. Verify that attendance, leave, expenses, assets, and recruitment data stay isolated to that organization.

## Available Scripts

### Client

From `client/package.json`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

From `server/package.json`:

```bash
npm run dev
npm start
```

## Authentication and Security

The project currently uses several security-related controls:

- JWT-based authentication
- HTTP-only cookie session storage
- role-based access middleware
- OTP verification for critical auth flows
- IP logging on login
- IP and user blocking capabilities
- cookie-based auth propagation into Socket.IO connections
- tenant-aware access validation in service logic

### Security Notes

- frontend requests are sent with `withCredentials: true`
- cookies are configured with `httpOnly`
- cross-origin requests are enabled for trusted frontend origins
- production deployments should run over HTTPS
- tenant-aware service checks help prevent cross-organization access

## Realtime Communication

Socket.IO is initialized on the backend in `server/src/server.js` and on the frontend in `client/src/socket.js`.

Current realtime usage includes:

- room-based subscriptions for admins
- room-based subscriptions for managers
- user-specific socket rooms
- tenant-aware event isolation
- request update broadcasting

Supported events in the current implementation include:

- `requestCreated`
- `requestUpdated`

## Deployment Notes

- the frontend contains `client/vercel.json`, which indicates Vercel deployment support for the UI
- set `CLIENT_URL` to the deployed frontend origin
- set `VITE_BASE_URL` to the deployed backend base URL
- use HTTPS in production because cookies are secure in real deployments
- ensure MySQL and any mail/cloud integrations are configured in the deployment environment
- verify tenant-aware environment configuration when deploying as a shared multi-organization system

## Current Limitations

- no automated test suite is configured yet
- no root license is defined yet
- no `.env.example` files are included yet
- API request and response examples are not documented yet
- setup instructions do not yet include seed/demo data for multiple organizations
- organization onboarding documentation can be expanded further with payload examples

## Roadmap

- add `.env.example` files
- add Postman or OpenAPI documentation
- add screenshots of admin, manager, and user dashboards
- add screenshots for the organization registration flow
- add seed scripts for demo users, policies, and organizations
- add automated tests for auth and core HR workflows
- add deployment guides for frontend and backend
- expand documentation around tenant lifecycle and organization administration

## Conclusion

This project represents a practical, multi-organization HRMS Dashboard System with clear module separation, role-based workflows, and a broad operational scope. It is suitable as a major project, portfolio project, or foundation for a more production-ready SaaS-style HR platform.
