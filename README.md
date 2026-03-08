# Job Application Tracker

A web app to track your job applications. Add applications with company, role, status, date, and notes. Filter by status or **Today's follow-ups**. Data is stored in your browser (localStorage).

## Live app

**[→ Use the app](https://job-tracker-seven-alpha.vercel.app/)**

## Features

- **Statuses:** Applied, Waiting for referral, Interviewing, Offer, Rejected
- **Waiting for referral:** Add multiple referrals with name and contact (email, LinkedIn URL, or phone). Click a contact to open Gmail, LinkedIn, or your phone app.
- **Follow-up interval:** Set a reminder (e.g. every 7 days) and optional next follow-up date
- **Today's follow-ups:** Filter or section for applications due for follow-up today; mark as done to schedule the next one
- **Filters:** All, Today's follow-ups, and by status

## Run locally

```bash
cd job-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build locally
```

## Deploy to Vercel

1. Push this project to a Git repo (GitHub, GitLab, or Bitbucket).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New** → **Project** and import your repo.
4. Leave **Build Command** as `npm run build` and **Output Directory** as `dist`.
5. Click **Deploy**. Your app will be live at a `*.vercel.app` URL.

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

Follow the prompts; your app will be deployed and you’ll get a live URL.
