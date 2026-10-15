# Nurturely: AI Family Ecosystem

Nurturely is a React/Vite application. Supabase Auth handles email/password registration, login, and sessions. This repository's current deployment runs the frontend only; the `backend/` directory contains empty module placeholders and is not a runnable API.

## Current application limits

- The frontend calls Supabase Auth directly and has no Nurturely API client or backend URL configuration.
- Family/child profiles, conversations, requests, and other app records use browser `localStorage`. They are not shared between devices, backed up to a server, or protected by server authorization. Do not store sensitive child, health, identity, or payment information in this demo.
- The AI reflection UI uses prewritten local responses, not a remote AI backend. No tracked code reads `backend/.env` or uses an `OPENAI_API_KEY`.
- There is no Supabase database query in the current app; database RLS policies cannot be assessed from this repository.

## Supabase configuration

The Vite build reads:

- `VITE_SUPABASE_URL`: the HTTPS Project URL from Supabase API settings.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's browser publishable key.

The publishable key is intended to be visible to browser users. Never use a Supabase secret key, legacy `service_role` key, database password, or private token in a `VITE_` variable. Registration receives a session only when Supabase Auth's email-confirmation settings permit immediate sign-in. Set the Supabase Auth Site URL and allowed redirect URLs for the deployed frontend and local development.

For local Vite development, put those variables in the ignored `frontend/.env`:

```powershell
cd frontend
npm ci
npm run dev
```

Build locally with:

```powershell
npm --prefix frontend ci
npm --prefix frontend run build
```

## Jenkins and AWS EC2 deployment

The Jenkins pipeline uses the GitHub repository configured by the Jenkins job and expects branch `main`. Configure the job to check out `https://github.com/Disha-Goyal1/nurturely-cicd.git`, branch `main`, and use this repository's `Jenkinsfile`.

The Jenkins agent must have Docker Engine and the Docker Compose v2 plugin available to the Jenkins service account, with permission to access the Docker daemon. The pipeline runs `docker compose version` and `docker info` before building. If either fails, fix the actual Jenkins agent's Docker/Compose installation or access rather than changing Supabase keys.

Create Jenkins Secret Text credentials with these IDs:

- `nurturely-supabase-url` — value for `VITE_SUPABASE_URL`.
- `nurturely-supabase-publishable-key` — value for `VITE_SUPABASE_PUBLISHABLE_KEY`.

These are injected into the build environment and Compose build arguments. The publishable key is public client configuration, not a privileged secret. Never configure a service-role key in Jenkins for a frontend build.

The Compose service builds the Vite app with the two variables, serves it through Nginx over HTTP port 80, and uses `/health` as its container health check. Nginx falls back to `index.html` for client-side routes such as `/dashboard`. Open inbound TCP port 80 in the EC2 security group; do not expose the Vite development server or a database. Plain HTTP does not encrypt credentials or tokens; use HTTPS before collecting real credentials or sensitive information.

For local Compose validation, the repository-root Compose file does not automatically load `frontend/.env`; pass it explicitly:

```powershell
docker compose --env-file frontend/.env config --quiet
docker compose --env-file frontend/.env build frontend
```

These commands validate and build but do not start containers. Do not run `docker compose up` against a production host without authorization.

## Backend deployment status

There is no backend service to build or deploy yet: no backend `package.json`, server entry point, routes, database integration, tests, Dockerfile, or health endpoint exists. The current frontend does not call a backend, so it cannot be described as connected to one. Implement and test backend functionality before adding a backend Compose service or claiming a full-stack deployment.
