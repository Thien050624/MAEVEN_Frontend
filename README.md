# MAEVEN Frontend

React + Vite frontend for the MAEVEN fashion e-commerce app.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to your backend API URL.

Example:

```env
VITE_API_BASE_URL=http://localhost:5080/api
```

## Deploy To Vercel

1. Push this folder as its own GitHub repository.
2. Import the repository in Vercel.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`
4. Add this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-azure-backend.azurewebsites.net/api
```

After Vercel gives you a production URL, add that URL to the backend `Cors__AllowedOrigins__0` setting in Azure.
