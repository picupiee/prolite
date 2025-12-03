# Deploying Firestore Security Rules

**IMPORTANT**: You must deploy the Firestore security rules for the app to work properly!

## Quick Deploy (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **prolite-43238**
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the editor
6. Click **Publish**

## Why This Is Required

The security rules enforce:
- Multi-tenant data isolation by `projectId`
- Role-based access control (Owner, Editor, Viewer)
- Project membership verification

**Without deploying these rules, you won't be able to:**
- Create or view projects
- Access collections
- Add or view records

## Verify Rules Are Active

After deploying, test by:
1. Creating a new project
2. Adding a collection
3. Entering data

If you see permission errors, the rules haven't been deployed yet.
