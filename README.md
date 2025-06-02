# Charging Station Management Full-Stack App

This project is a full-stack application for managing charging stations. It includes a backend API and a frontend user interface.

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
    cd frontend/ev-charger-app
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
      VITE_API_BASE_URL=http://localhost:3000/api
      ```
    - This file is usually created during setup or can be created manually.
4.  Run the development server:
    ```bash
    npm run dev
    ```
    (or `yarn dev`)

The frontend development server will start, typically on `http://localhost:5173` (Vite's default).

## Deployment (Vercel)

Follow these steps to deploy the backend and frontend to Vercel:

1.  **Prepare Your Repository:**

    - Ensure your project is pushed to a GitHub, GitLab, or Bitbucket repository.

2.  **Vercel Account:**

    - Sign up or log in to Vercel at [vercel.com](https://vercel.com).

3.  **Create Backend Project on Vercel:**

    - Click "New Project" on your Vercel dashboard.
    - Import your Git repository.
    - **Root Directory:** When prompted, specify `backend` as the Root Directory.
    - **Framework Preset:** Vercel should detect it as a Node.js project.
    - **Build and Output Settings:**
      - Ensure the Build Command is set (e.g., `npm run vercel-build` or `npm run build`).
      - The Output Directory is usually not applicable for `@vercel/node` builds in the same way as static sites, but ensure settings are sensible if prompted.
    - **Environment Variables:**
      - Navigate to your project's Settings > Environment Variables in Vercel.
      - Add the following variables:
        - `MONGODB_URI`: Your MongoDB Atlas connection string or other cloud MongoDB URI.
        - `JWT_SECRET`: A strong, unique secret key for JWT signing.
        - `JWT_EXPIRES_IN`: Token expiration time (e.g., `1h`, `7d`).
    - Click "Deploy".
    - Once deployed, note the **Deployed Backend URL** (e.g., `your-backend-name.vercel.app`). This will be your public API endpoint.

4.  **Create Frontend Project on Vercel:**

    - Click "New Project" again on your Vercel dashboard.
    - Import the **same** Git repository.
    - **Root Directory:** When prompted, specify `frontend/ev-charger-app` as the Root Directory.
    - **Framework Preset:** Vercel should detect it as a Vite project.
    - **Build and Output Settings:**
      - Ensure the Build Command is correct (e.g., `npm run build`).
      - The Output Directory should be `dist` (Vite's default).
    - **Environment Variables:**
      - Navigate to your project's Settings > Environment Variables in Vercel.
      - Add the following variable:
        - `VITE_API_BASE_URL`: The **Deployed Backend URL** you noted earlier (e.g., `https://your-backend-name.vercel.app/api`). Make sure to include the `/api` path if your backend routes are set up that way.
    - Click "Deploy".
    - This will give you the **Deployed Application URL** for your frontend.

5.  **Testing:**
    - After both deployments are complete, thoroughly test your frontend application.
    - Verify that it communicates correctly with the deployed backend API.
    - Test backend API endpoints directly if needed.

### Authentication Endpoints

The following authentication endpoints are available:

- `POST /api/auth/register`: Register a new user.
  - Request body: `{ "username": "testuser", "email": "test@example.com", "password": "password123" }`
- `POST /api/auth/login`: Log in an existing user.
  - Request body: `{ "login": "test@example.com", "password": "password123" }` (login can be username or email)

### Protected Routes

The charging station management APIs (Create, Update, Delete operations on `/api/stations`) are now protected and require a JSON Web Token (JWT) to be included in the `Authorization` header as a Bearer token.

Example: `Authorization: Bearer <your_jwt_token>`

## Deliverables

Upon completion and deployment, ensure you have the following:

- **Deployed Frontend URL:** The public URL where the frontend application is accessible.
- **Deployed Backend API URL:** The public base URL for the backend API endpoints.
