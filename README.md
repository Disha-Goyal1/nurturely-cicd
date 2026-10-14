# Nurturely

Nurturely is a static React website. It has no API server, database, external AI service, payment integration, or third-party runtime dependency.

## Run locally

Requirements: Node.js 22 or newer.

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. No environment file or API key is required.

## Build for static hosting

```powershell
cd frontend
npm run build
```

Deploy the generated `frontend/dist` folder to any static hosting provider. For Netlify, use `frontend` as the base directory, `npm run build` as the build command, and `dist` as the publish directory. The included `_redirects` file enables client-side routes on Netlify; `vercel.json` provides the equivalent rewrite for Vercel.

## Available features

- Browser-based registration and sign-in for parent, caregiver, and therapist roles
- Browser-only family profiles and child profile create, edit, and delete
- Saved guided reflections, community notes, care requests, and appointment requests
- Sample caregiver and therapist directories
- Local availability and professional profile editors
- Subscription plan selection without billing

All records stay in the current browser profile and do not sync between devices or users. Browser storage is not encrypted, and sign-in is not server-protected authentication. Do not store sensitive child, health, identity, or payment information here. Directory profiles are samples, requests are not delivered to providers, and the guided reflection tool uses prewritten responses rather than AI or professional advice. SOS requests are saved in this browser; use its call/text links to contact a trusted person directly. It cannot alert a caregiver or emergency services.
Testing Jenkins CI/CD webhook
