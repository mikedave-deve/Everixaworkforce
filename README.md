# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Backend, employee portal & admin portal

**Stack:** React + Vite frontend; a single serverless API function (`api/[...route].js` → `server/`) on Vercel;
MongoDB for data; **Vercel Blob** for uploaded files; Hostinger's HTTP Mail API for email.

### Run locally
```bash
npm install
cp .env.example .env      # then fill it in (see below)
npm run dev               # frontend + API on http://localhost:5173  (API at /api)
npm run api               # optional: API alone on PORT (default 4000)
npm run test:api          # 21 end-to-end API tests (embedded DB, mail dry-run, never touches real services)
```
With `MONGODB_URI` empty, local dev uses an embedded database in `.data/mongo`. With `BLOB_READ_WRITE_TOKEN`
empty, files are stored in `.data/blob`. With `HOSTINGER_API_TOKEN` empty, emails are logged instead of sent.

### Key environment variables
| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Database (collections are created automatically) |
| `JWT_SECRET` | Signs sessions **and** derives the key that encrypts bank / ID numbers — use a long random value in production |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token (required in production for uploads) |
| `HOSTINGER_API_TOKEN`, `HOSTINGER_MAILBOX_ADDRESS` | Email sending (the mailbox resource ID is looked up automatically) |
| `COMPANY_NOTIFY_EMAIL` | Where form submissions and requests are emailed |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First administrator, created automatically if none exists |
| `FRONTEND_ORIGIN`, `FRONTEND_LOGIN_URL` | CORS and the sign-in link used in emails |

### How it fits together
- **Accounts:** sign-up creates a *pending* account and emails the employee + admin. Approving/rejecting in
  **Admin → Approvals** emails the employee. Only approved accounts can sign in.
- **Admin portal (`/admin`):** Approvals (with automatic checklists and a recommendation per item), Employees,
  Missions, Pay, Documents, Shipments (create, advance, pause with reason, PDF invoice) and the Submissions inbox.
- **Employee portal (`/portal`):** every page reads and writes real data through the API.
- **Files** are never exposed by URL: downloads go through `GET /api/files/:id`, which checks the signed-in user.
- **Website forms** (Contact, Apply Now, Submit Resume) post to `/api/public/*`, are rate-limited and honeypot-protected,
  are stored, and are emailed to `COMPANY_NOTIFY_EMAIL`.
