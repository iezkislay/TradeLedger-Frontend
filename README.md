# TradeLedger Frontend

TradeLedger is a modern billing, inventory, customer ledger, sales return, and refund management system built for hardware, sanitary, plumbing, electrical, and retail stores.

This repository contains the React + Vite frontend application.

---

## Features

### Billing

* Create bills quickly
* Cash, UPI and Credit sales
* Bill printing (A4, A5, A6)
* Customer-wise billing history
* Bill adjustments
* Discount support

### Inventory Management

* Item catalog management
* Category and brand support
* Stock tracking
* Low stock alerts
* Item search and filtering

### Customer Management

* Customer ledger
* Outstanding dues
* Customer statements
* Payment tracking
* Balance calculation

### Sales Returns

* Partial returns
* Full returns
* Delivered item returns
* Pending item returns
* Return note generation
* Return reconciliation

### Refund Management

* Refund against finalized returns
* Refund history tracking
* Audit logging
* Settlement calculations

### Reporting

* Sales reports
* Customer balances
* Outstanding amount tracking
* Return reports
* Stock reports

---

## Technology Stack

* React
* Vite
* React Router
* Axios
* JavaScript (ES6+)
* CSS
* REST API Integration

---

## Project Structure

```text
src/
├── api/
├── components/
├── pages/
├── routes/
├── utils/
├── assets/
├── App.jsx
└── main.jsx
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd app-frontend
```

Install dependencies:

```bash
npm install
```

---

## Running Locally

Start development server:

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

Generated files will be available in:

```text
dist/
```

Preview production build:

```bash
npm run preview
```

---

## Environment Configuration

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Example production configuration:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## Printing Support

TradeLedger supports:

* A4 bills
* A5 bills
* A6 bills
* Customer invoices
* Estimate printing
* Return note printing

---

## User Roles

### Owner

* Full system access
* Manage inventory
* Manage users
* Process refunds
* View reports

### Billing User

* Create bills
* Manage customers
* Accept payments
* Create return notes

---

## Development Guidelines

* Keep components reusable
* Prefer API-driven UI
* Maintain responsive layouts
* Avoid business logic in components
* Use centralized API configuration

---

## Backend

TradeLedger Backend is built using:

* Spring Boot
* PostgreSQL
* Hibernate/JPA
* REST APIs

---

## License

Private Proprietary Software

© TradeLedger. All Rights Reserved.
