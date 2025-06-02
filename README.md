# Charging Station Management Full-Stack App

This project is a full-stack application for managing charging stations. It includes a backend API and a frontend user interface.

## Deliverables

- **Deployed Frontend URL:** https://evoltsoft-assignment-n3ev.vercel.app/
- **Deployed Backend API URL:** https://evoltsoft-assignment.vercel.app/

## Test Accounts

- **Email** : `test@test.com`
- **Password** : `123456`

## Setup Instructions

### Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    (or `yarn install` if you prefer Yarn)
3.  **Environment Variables:**
    - Create a `.env` file in the `backend` directory.
    - Add the following line, replacing with your actual MongoDB connection string if different:
      ```
      MONGODB_URI=mongodb://localhost:27017/charging_stations_db
      JWT_SECRET=yourstrongrandomsecretkey # Replace with a strong, random string
      JWT_EXPIRES_IN=1h # Or 7d, etc.
      APP_URL=http://localhost:5173
      ```
    - Ensure you have a MongoDB instance running and accessible at this URI.
    - The `JWT_SECRET` is crucial for security; ensure it's a complex, unique string.
    - `JWT_EXPIRES_IN` defines the token's validity period.
4.  Run the development server:
    ```bash
    npm run dev
    ```
    (or `yarn dev`)

The backend server will start, typically on `http://localhost:3000`.

### Frontend

1.  Navigate to the frontend project directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    (or `yarn install` if you prefer Yarn)
3.  **Environment Variables:**
    - The frontend uses a `.env` file in the `frontend/ev-charger-app` directory for configuration.
    - Ensure it contains the API base URL:
      ```
      VITE_API_BASE_URL=http://localhost:3000/
      ```
    - This file is usually created during setup or can be created manually.
4.  Run the development server:
    ```bash
    npm run dev
    ```
    (or `yarn dev`)

The frontend development server will start, typically on `http://localhost:5173` (Vite's default).
