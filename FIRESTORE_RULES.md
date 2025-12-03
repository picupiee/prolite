# Deploying Firestore Security Rules

The `firestore.rules` file contains comprehensive security rules for the multi-tenant data collection system.

## Security Model

### Role Hierarchy
- **Owner** (level 3): Full access - can manage members, delete project/collections
- **Editor** (level 2): Can create/edit collections, fields, and records
- **Viewer** (level 1): Read-only access to all project data

### Access Control Rules

1. **Projects**: Members can read, only owners can update/delete
2. **Collections**: Members can read, editors+ can create/update, owners can delete
3. **Field Definitions**: Members can read, editors+ can create/update, owners can delete
4. **Records**: Members can read, editors+ can create/update, editors can delete own records, owners can delete any

## Deploying Rules

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste and click **Publish**

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Testing Rules

You can test the rules in Firebase Console:
1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test different scenarios with different user IDs and roles

## Important Notes

- The `projectMembers` collection uses a composite ID format: `{projectId}_{userId}`
- All project-related data is isolated by `projectId`
- Users must be members of a project to access any of its data
- The rules check membership via the `projectMembers` collection
