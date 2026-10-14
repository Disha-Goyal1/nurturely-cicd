# Nurturely

Nurturely is a React app using Supabase Auth for account registration, login, session persistence, profile updates, and logout. Family profiles and other app records remain browser-local.

## Configure Supabase

1. In Supabase, use the project's **Project URL** and **publishable key**. Never use a `service_role` key in the frontend.
2. In **Authentication → URL Configuration**, set the Site URL to the deployed site URL and allow the exact login redirect URL (for example, `http://13.211.67.223/login`) and your local URL (for example, `http://localhost:5173/login`).
3. In the repository's `frontend` directory, create an untracked `.env`:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   These are public browser configuration values, not an authorization secret. The Supabase publishable key is intended for client apps; enforce access with Supabase Auth and Row Level Security for any database policies.
4. For the development/demo setup, disable email confirmation in Supabase Auth settings. Registration signs the user in when Supabase returns an active session; if it does not return a session, the app shows an actionable error instead of claiming registration succeeded.

The SDK persists and refreshes auth sessions. Existing browser-only demo accounts are not migrated; register with Supabase on the new build.

## Services and data persistence

The current Compose stack contains only the frontend. Supabase Auth handles registration, login, and sessions directly from the browser; the `backend` directory is an empty module scaffold, not a runnable API. No PostgreSQL service or `POSTGRES_PASSWORD` is required. Other family/app records remain in browser `localStorage`, not in a server database or Docker volume.

## Run locally

Requirements: Node.js 22 or newer.

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

## Build

```powershell
cd frontend
npm ci
npm run build
```

## Deploy through Jenkins to EC2

The supplied Docker Compose stack serves the built website through Nginx on port **80**. Jenkins remains on its existing port **8080**. The static frontend sends Supabase Auth requests directly to the configured Supabase Project URL; Nginx provides the SPA fallback for page refreshes such as `/dashboard`.

1. Configure the Jenkins Pipeline job to use `https://github.com/Disha-Goyal1/nurturely-parenting-app.git` and branch `main` (or confirm the Multibranch Pipeline discovers that repository and branch). The `Jenkinsfile` uses Jenkins' `scm` checkout; the repository and branch are selected by the job configuration.
2. On the EC2 host (or the machine running the Jenkins deployment agent), install Docker Engine and the Docker Compose plugin. Ensure Jenkins can run Docker Compose.
3. Allow inbound TCP **port 80** in the EC2 security group. Keep Jenkins on port **8080**.
4. In Jenkins, create two **Secret text** credentials:
   - `nurturely-supabase-url` — the Supabase Project URL.
   - `nurturely-supabase-publishable-key` — the Supabase publishable key, not a `service_role` key.
5. Create or run the Jenkins Pipeline job using this repository's `Jenkinsfile`. It installs dependencies, builds the frontend with those Vite variables, builds and starts the Nginx container, and checks the health and login page routes.
6. Configure the Supabase Auth Site URL and allowed redirect URL for `http://13.211.67.223/login`, then visit `http://13.211.67.223`.

<<<<<<< HEAD
For a manual Docker Compose build, export the same two variables in the shell before `docker compose up -d --build`, or put them in an untracked root `.env` based on `.env.example`. The deployment build requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; neither should contain a service-role secret.

## Transport security

Plain HTTP does **not** encrypt passwords, auth tokens, or session traffic in transit. HTTPS is required before collecting real credentials or sensitive information. Use HTTP only for a controlled demo with test accounts.

Family/child profiles and other non-auth app records still remain in each browser and are not synced to Supabase.
=======
All records stay in the current browser profile and do not sync between devices or users. Browser storage is not encrypted, and sign-in is not server-protected authentication. Do not store sensitive child, health, identity, or payment information here. Directory profiles are samples, requests are not delivered to providers, and the guided reflection tool uses prewritten responses rather than AI or professional advice. SOS requests are saved in this browser; use its call/text links to contact a trusted person directly. It cannot alert a caregiver or emergency services.
Testing Jenkins CI/CD webhook
>>>>>>> 93f77196d6687112d32d86a15199e6848872b211
