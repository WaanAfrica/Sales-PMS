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

- Administrator: `Kobiakithinji16@gmail.com` / `Kobia@2026.`
- Sales Personnel: `kobia@matrixwater.co.ke` / `Kobia@2026.`
- Sales Personnel: `munene@matrixwater.co.ke` / `Munene@2026.`

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
