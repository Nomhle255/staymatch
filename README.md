# StayMatch

StayMatch is a student accommodation platform connecting students with landlords offering off-campus housing. Students can discover and match listings near their university, landlords can publish and manage accommodation, and administrators can review listings and manage the platform.

## Features

### Students

- Register and manage a profile.
- Browse and filter accommodation by price, property type, location, amenities, and availability.
- Rank listings using preference-based matching.
- Optionally convert a natural-language request into structured preferences.
- Receive in-app and optional browser push notifications for matching listings.
- Contact landlords through WhatsApp and arrange viewings.

### Landlords

- Create accommodation listings with location, price, amenities, availability, and photos.
- View and edit owned listings.
- Mark listings as available or occupied.
- See review notes from administrators.

### Administrators

- Review and manage accommodation listings.
- Manage landlords and universities.
- Add universities and geographic coordinates.
- Monitor platform activity from the admin dashboard.

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- PostgreSQL with Prisma
- Tailwind CSS 4 and PostCSS
- JWT authentication with HTTP-only cookies
- bcrypt password hashing
- Cloudinary image uploads
- Leaflet maps
- Nodemailer password-reset email delivery
- Web Push browser notifications

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create a private `.env` file in the project root and configure the required environment variables listed below. Never commit this file or share its values.
3. Apply migrations and generate Prisma Client:

- Review and manage accommodation listings.
- Manage landlords and universities.
- Add universities and geographic coordinates.
- Monitor platform activity from the admin dashboard.

4. Seed the default models:

```bash
npx prisma db seed
```

5. Start the development server:

## Prerequisites

Open [http://localhost:3000](http://localhost:3000/).

## Environment configuration

Create a private `.env` file in the project root and configure the required environment variables listed below. Never commit this file or share its values.

### Required

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Signs authentication tokens; required in production |
| `PASSWORD_RESET_SECRET` | Signs password-reset tokens |

To obtain the required values:

1. Create a PostgreSQL database locally or with a managed provider such as [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/), then use the provider's private connection string as `DATABASE_URL`.
2. Generate long random values for `JWT_SECRET` and `PASSWORD_RESET_SECRET`. These are application secrets, not third-party account credentials.

### Optional integrations

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Enables Google sign-in |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for photo uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENAI_API_KEY` | Enables natural-language preference interpretation |
| `GROQ_MODEL` | Overrides the default preference-interpreter model |
| `SMTP_HOST` | SMTP server for password-reset emails |
| `SMTP_PORT` | SMTP server port; defaults to `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Optional sender address for password-reset |

- Google: create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/).
- Cloudinary: create an account in [Cloudinary](https://cloudinary.com/) and copy the cloud name and API credentials from the dashboard.
- AI preference interpretation: create an API key with the AI provider configured by the application and store it only in the server environment.
- Password-reset email: use SMTP credentials from an email provider or an SMTP service such as [Brevo](https://www.brevo.com/) or [Mailgun](https://www.mailgun.com/).

### Browser push notifications

Browser push is optional. Generate VAPID credentials locally:

```bash
npx web-push generate-vapid-keys
```

Store the generated values privately in `.env` using these variable names: `WEB_PUSH_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and `VAPID_PRIVATE_KEY`.

Push notifications require HTTPS in production. The service worker is served from `/sw.js`, and students can enable device alerts from their dashboard.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate deploy` | Apply pending migrations |
| `npx prisma db seed` | Seed default roles and the development administrator |
| `npx prisma studio` | Open Prisma Studio |

## Database model overview

The Prisma schema contains `User`, `Role`, `Accommodation`, `University`, `StudentPreference`, `Notification`, and `PushSubscription` models.

Accommodation statuses include `PENDING_REVIEW`, `VERIFIED`, `AVAILABLE`, `OCCUPIED`, and `INACTIVE`. Listings are reviewed before being surfaced to students.

## Development notes

- The seed creates the development administrator defined in [`prisma/seed.ts`](./prisma/seed.ts). Check the `administrator` object in that file for the login credentials.
- Never commit `.env` files, API credentials, or generated private keys.
- Use `npx prisma migrate dev --name <description>` for new development migrations.
- Run `npm run lint` before submitting changes.
- The production build runs `prisma generate` automatically.
