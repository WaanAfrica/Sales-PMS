# Sales PMS

A modern sales performance management system built with Next.js, Prisma, PostgreSQL, and Tailwind.

## Setup

1. Install dependencies
   ```bash
   pnpm install
   ```
2. Configure PostgreSQL and update `.env.local`.
3. Run Prisma migrations
   ```bash
   pnpm prisma migrate dev --name init
   ```
4. Seed the database
   ```bash
   pnpm prisma:seed
   ```

## Default credentials

- Administrator: `admin@company.com` / `Admin@123`
- Sales Personnel: `collins@company.com` / `Sales@123`

5. Start the app
   ```bash
   pnpm dev
   ```

## Features

- Authentication with admin and salesperson roles
- Daily sales report submission and editing
- KPI dashboards and target tracking
- Monthly reporting and export-ready summaries
- User management for administrators
