# BR Collection - Telegram WebApp

A premium visually stunning Telegram Mini App for a men's clothing store called "BR Collection".

## Tech Stack
- React + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- @twa-dev/sdk

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```
   *Note: Telegram specific features like `initDataUnsafe` will use mock fallback data in the browser.*

3. **Build for production:**
   ```bash
   npm run build
   ```

## Admin Panel
- **Access:** Tap the gear icon in the top right.
- **PIN:** `1234`
- **Features:** Manage Global Sale, Add/Edit/Delete Products, View Orders & Stats.

## Deployment to Vercel
1. Upload this codebase to GitHub.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your GitHub repository.
4. Leave the Framework Preset as `Vite` (it should auto-detect).
5. Deploy!

## Connect to BotFather
1. Go to [@BotFather](https://t.me/botfather) on Telegram.
2. Use `/newbot` to create your bot if you haven't.
3. Use `/newapp` to create a new Web App (Mini App).
4. Enter the URL provided by Vercel for your deployed app.
5. Set up the Menu Button so users can open the app directly from your bot chat.
