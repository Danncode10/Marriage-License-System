# 🚀 Next.js + Supabase Authentication Template

This is a premium, ready-to-use **Next.js** authentication template integrated with **Supabase SSR**. It features a modern design, secure authentication flow, and is optimized for deployment on Vercel.

---

## ✨ Features

- **Next.js 15+** (App Router)
- **Supabase SSR** for Auth & Data
- **Tailwind CSS 4.0** for Styling
- **TypeScript** for Type Safety
- **Responsive UI** with modern aesthetics
- **Secure Middleware** for route protection
- **Pre-configured Auth Logic** (Login, Sign Up, Sign Out)

---

## 🛠️ Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Supabase Account](https://supabase.com/)
- A [Vercel Account](https://vercel.com/) (for deployment)

---

## 🔐 Environment Variables

Environment variables securely store sensitive information like API keys. You MUST configure these for the application to work.

### Local Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 🛰️ How to get these values:

1.  Log in to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2.  Select your project (or create a new one).
3.  Navigate to **Settings** (gear icon) > **API**.
4.  Copy the **Project URL** and paste it into `NEXT_PUBLIC_SUPABASE_URL`.
5.  Copy the **anon public** key and paste it into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6.  Copy the **service_role secret** key and paste it into `SUPABASE_SERVICE_ROLE_KEY`.

> [!WARNING]
> Keep your `SUPABASE_SERVICE_ROLE_KEY` secret. Never expose it in client-side code (any variable NOT prefixed with `NEXT_PUBLIC_`).

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Run Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ☁️ Deployment on Vercel

The easiest way to deploy this project is via [Vercel](https://vercel.com/).

### 1. Push to GitHub
Create a new repository and push your code.

### 2. Connect to Vercel
1.  Go to the [Vercel Dashboard](https://vercel.com/new).
2.  Import your GitHub repository.
3.  In the **Environment Variables** section, add the following (copy from your `.env.local`):
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
4.  Click **Deploy**.

### 3. ⚠️ CRITICAL: Configure Supabase Auth
Once Vercel gives you your deployment URL (e.g., `https://your-app.vercel.app`), you MUST update your Supabase settings or authentication will fail:

1.  Go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2.  Navigate to **Authentication > URL Configuration**.
3.  **Site URL**: Change this to your Vercel production URL (e.g., `https://your-app.vercel.app`).
4.  **Redirect URLs**: Add your callback URL: `https://your-app.vercel.app/auth/callback`.

> [!TIP]
> If you have custom domains, make sure to add them here as well so Supabase knows where to safely redirect users after login/signup.

---

## 📂 Project Structure

```text
├── src/
│   ├── app/           # Next.js App Router (Pages & API)
│   ├── components/    # Reusable UI components
│   ├── lib/           # Supabase client & utility functions
│   └── middleware.ts  # Auth protection middleware
├── public/            # Static assets
└── .env.local         # (Ignored) Environment variables
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the MIT License.
