# PalliBazaar Developer Guide

This guide covers local setup, architecture, API routes, and deployment workflows for PalliBazaar.

## Environment Setup

- Install Node.js 20 or newer along with npm.
- Provide a valid MongoDB connection URI in `.env.local`.
- Configure both publishable and secret Stripe keys for payment flows.
- Set a strong Better Auth secret and base URL for session handling.

## Database Seeding

- Trigger `/api/seed` in local development to populate initial data.
- Seed scripts create sample rural products, categories, and seller profiles.

## API Architecture

- Product routes handle fetching, filtering, and creating marketplace items.
- Authentication routes manage user registration, login, and active sessions.
- Payment routes create Stripe checkout sessions and validate transactions.
- The `/api/ai/analyze-data` route generates marketplace insights for sellers.

## Frontend Guidelines

- Place route segments under `src/app` following Next.js App Router conventions.
- Keep shared interface components organized inside `src/app/Components`.
- Use `PageAnimatePresence` to maintain smooth transitions between routes.
- Prefer Tailwind CSS utility classes for consistent spacing and responsive layouts.
- Support both light and dark modes through `next-themes` provider hooks.
- Display non-blocking user feedback using `react-hot-toast`.
- Render seller and market trend visualizations with Recharts components.

## Testing and Verification

- Use `src/lib/test-backend.ts` to verify database connectivity and helper functions.
- Run `npm run lint` to catch TypeScript and ESLint issues early.

## Deployment Checklist

- Confirm all required production environment variables are configured on the host.
- Verify that `npm run build` succeeds cleanly prior to releasing.

## Troubleshooting

- Delete the `.next` directory and restart the dev server if build cache errors occur.

- All handicrafts must meet regional authenticity checks and natural fiber verification.