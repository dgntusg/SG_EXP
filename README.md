# 🧾 Singapore Ledger (SG Ledger)

A retro-modern, thermal receipt style daily expense tracker for Singapore, seamlessly synced with Google Sheets, powered by multi-provider AI receipt scanning (Google Gemini / Anthropic Claude / OpenAI), voice logging, budget pacing, and offline PWA capability.

---

## ✨ Features & Upgrades

- **Authentic Vintage Thermal Receipt UI**: Authentic paper texture, jagged tear-off edge, barcode footer, and tactile typewriter audio.
- **⚡ Instant 0ms Optimistic UI**: Add, edit, or delete items instantly with local caching and silent background synchronization to your Google Sheet.
- **📶 Offline First Sync**: Works anywhere (even on the MRT underground with zero cellular signal) and auto-syncs when reconnected.
- **📸 Smart AI Receipt Scanner**:
  - Automatically downsizes and compresses camera snapshots on the device for 5x faster scanning.
  - Supports **Google Gemini** (`gemini-2.5-flash` - fast & free tier), **Anthropic Claude** (Claude 3.5 Sonnet), and **OpenAI** (`gpt-4o-mini`).
  - Specially calibrated for Singapore receipts (SGD, GST breakdown, MRT/Bus transit, hawker centres, FairPrice, Sheng Siong, Grab, etc.).
- **🎙️ Voice & Quick Text Entry**: Speak or type *"Yakun Kaya Toast 6.20 food"* or *"Grab to office 14.50"* to auto-categorize and fill.
- **📊 Monthly Budget & Pace Analysis**: Set a monthly budget to track remaining funds, daily burn allowance, and projected month-end spend.
- **✏️ Full CRUD & Quick Edit**: Tap any item on the tape to edit merchant, amount, category, date, or note.
- **🔍 Live Search & Filter**: Filter by category pills or search merchant names and notes in real time.
- **💾 Export & Backup**: Download monthly or all-time CSV spreadsheets, JSON backup, or print a vintage paper tape receipt summary.
- **🎨 Multi-Theme**: Toggle between **Classic Parchment**, **Midnight Ledger (Dark Mode)**, and **Clean Minimal**.
- **📱 Installable PWA**: Add to iOS Safari or Android Chrome home screen for a full-screen native app experience.

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Step 1: Initialize Git and Push to Your GitHub Account

Run these commands in your terminal or PowerShell inside this project folder:

```bash
git init
git add .
git commit -m "Initial commit: Supercharged Singapore Ledger PWA"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

*(Replace `<YOUR_USERNAME>` and `<YOUR_REPO_NAME>` with your GitHub username and repository name).*

### Step 2: Turn on GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings** (top tab) -> **Pages** (left sidebar under *Code and automation*).
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select branch: `main` and folder `/ (root)`, then click **Save**.
5. After 1 minute, GitHub will give you your live URL: `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`.

---

## 📋 Google Sheets & Apps Script Setup

The app connects directly to your Google Sheet without needing third-party servers.

### 1. Update your Google Sheet Apps Script:
1. Open your Google Sheet (**SG Ledger**).
2. Go to **Extensions** > **Apps Script**.
3. Replace all contents in `Code.gs` with the code in [`Code.gs`](./Code.gs).
4. Update line 15 with your desired secret token:
   ```javascript
   const TOKEN = 'YOUR_SECRET_TOKEN_HERE';
   ```
5. Click **Deploy** (top right) > **Manage Deployments** > Click the **Pencil (Edit)** icon > Change Version to **New Version** > Click **Deploy**.
6. Ensure **"Who has access"** is set to **"Anyone"**.
7. Copy the **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).

### 2. Connect the App:
1. Open your live SG Ledger web app.
2. Tap the **Gear icon (⚙)** in the top right corner.
3. Enter your **Apps Script Web App URL** and **Shared Secret Token**.
4. Tap **Test Sheet Connection** to verify.
5. (Optional) Choose your AI Provider (e.g. Google Gemini) and paste your API key to enable instant receipt scanning.
6. Tap **SAVE SETTINGS**.

---

## 🔑 Recommended AI API Keys (Free & Fast)

- **Google Gemini (Recommended)**: Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey). It includes a generous free tier and ultra-fast vision processing.
- **Anthropic Claude**: Get an API key at [Anthropic Console](https://console.anthropic.com/settings/keys).
- **OpenAI**: Get an API key at [OpenAI Platform](https://platform.openai.com/api-keys).

---

## 📂 Project Structure

```
SG_EXP_APP/
├── index.html       # Supercharged single-page PWA application
├── Code.gs          # Google Apps Script backend with auto-sheet creation & batch sync
├── manifest.json    # Progressive Web App manifest
├── sw.js            # Offline service worker cache
├── icon-192.png     # App launcher icon (192x192)
├── icon-512.png     # App splash icon (512x512)
└── README.md        # Deployment and usage instructions
```
