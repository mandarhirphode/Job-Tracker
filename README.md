# Job Application Tracker

A simple web app to track your job applications. Add applications with company, role, status, date, and notes. Filter by status (Applied, Interviewing, Offer, Rejected). Data is stored in your browser (localStorage).

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
