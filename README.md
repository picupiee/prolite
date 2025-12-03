# SaaS Dashboard - Firebase Edition

A production-ready React SaaS Dashboard with Firebase Authentication and Firestore integration.

## Features

- 🔐 **Firebase Authentication** - Email/password authentication
- 🔥 **Firestore Database** - Real-time data storage and sync
- 📊 **Analytics Dashboard** - Interactive charts with Recharts
- 🎨 **Dark Mode** - System-wide theme toggle
- 📱 **Responsive Design** - Mobile-first approach
- 🛡️ **Role-Based Access Control** - Admin, Manager, User roles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: Zustand
- **Backend**: Firebase (Auth + Firestore)
- **Charts**: Recharts

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Email/Password provider
3. Create a **Firestore Database** in production mode
4. Copy your Firebase config from Project Settings

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Analytics collection
    match /analytics/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Activities collection
    match /activities/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Create Your First User

In Firebase Console:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. After creating, go to **Firestore Database**
5. Create a document in `users` collection with the user's UID:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "avatar": "https://ui-avatars.com/api/?name=Admin+User",
  "createdAt": "2025-12-03T00:00:00.000Z"
}
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── common/      # Reusable UI components
│   ├── layout/      # Layout components (Sidebar, Topbar)
│   └── auth/        # Auth-related components
├── pages/           # Page components
├── services/        # Firebase services
├── store/           # Zustand stores
├── hooks/           # Custom React hooks
├── config/          # Firebase configuration
└── types/           # TypeScript types
```

## User Roles

- **admin**: Full access to all features
- **manager**: Access to dashboard and settings
- **user**: Basic access to dashboard

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
