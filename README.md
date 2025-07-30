# Admin Portal

Admin portal for managing users, medical cases, and test executions.

## Features

- User authentication with username/password
- Google OAuth2 login integration
- User management with role-based permissions
- Medical case management
- Test execution tracking
- Dashboard with statistics

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth2 Client ID
   - `VITE_API_BASE_URL`: API base URL for legacy endpoints
   
### Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: Add your domain (e.g., `http://localhost:5173` for development)
5. Copy the Client ID and set it in your `.env` file

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## API Integration

The application integrates with two API endpoints:

### Authentication API
- **Base URL**: `https://testing-auth.aide.games/api/v1`
- **Login**: `POST /auth/login`
- **Google OAuth**: `POST /auth/oauth2/google`

### Legacy API  
- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Various endpoints**: Users, roles, medical cases, etc.

## Demo Credentials

For development/testing purposes:
- Username: `admin@example.com`  
- Password: `123456`

## Architecture

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Ant Design Vue** for UI components
- **Vue Router** for navigation
- **Axios** for API communication

## Project Structure

```
src/
├── api/           # API configuration and endpoints
├── components/    # Reusable Vue components
├── layouts/       # Layout components
├── router/        # Vue Router configuration
├── stores/        # Pinia stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── views/         # Page components
```
