# Akbar Brothers EMS Frontend

## API configuration

This app reads the backend base URL from `VITE_API_BASE_URL`.

- The default backend URL is `https://akbar-brothers-ems-backend.onrender.com`.
- Production builds use [.env.production](./.env.production), which currently points to `https://akbar-brothers-ems-backend.onrender.com`.
- When deploying the frontend, add `VITE_API_BASE_URL=https://akbar-brothers-ems-backend.onrender.com` in your hosting provider's environment variables.

To override the backend URL manually, create `.env` in the frontend directory with:

```env
VITE_API_BASE_URL=https://your-backend-url
```

## Deployment

Before deploying the frontend, make sure your hosting platform has this environment variable:

```env
VITE_API_BASE_URL=https://akbar-brothers-ems-backend.onrender.com
```

After adding or changing the variable, redeploy the frontend so Vite rebuilds with the updated backend URL.

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`
