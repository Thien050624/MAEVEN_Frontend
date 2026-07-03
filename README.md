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
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

## Cloudinary Product Images

Admin product editing can upload image files directly from the computer through Cloudinary unsigned uploads.

1. Create a Cloudinary account.
2. Go to Settings -> Upload -> Upload presets.
3. Create an unsigned upload preset.
4. Set the preset folder to `maeven/products` if you want images grouped in Cloudinary.
5. Add these variables locally and in Vercel:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

Do not put your Cloudinary API secret in the frontend.

## Deploy To Vercel

1. Push this folder as its own GitHub repository.
2. Import the repository in Vercel.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`
4. Add these Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

After Vercel gives you a production URL, add that URL to the backend `Cors__AllowedOrigins__0` setting in Render.
