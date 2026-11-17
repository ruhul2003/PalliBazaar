# PalliBazaar Developer Guide

This guide covers local setup, architecture, API routes, and deployment workflows for PalliBazaar.

## Environment Setup

- Install Node.js 20 or newer along with npm.
- Provide a valid MongoDB connection URI in `.env.local`.
- Configure both publishable and secret Stripe keys for payment flows.
- Set a strong Better Auth secret and base URL for session handling.

## Database Seeding

- Trigger `/api/seed` in local development to populate initial data.
