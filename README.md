# 🕉️ Shastra Life

![Shastra Life Banner](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

**Shastra Life** is a modern, minimalistic Hindu Calendar & Daily Oracle application designed to serve as your daily Vedic companion. It seamlessly blends ancient astrological and astronomical wisdom with cutting-edge web and mobile technologies.

---

## ✨ Features

* **Vedic Calendar (Panchang):** Accurate daily calculation of Tithi, Nakshatra, and Yoga.
* **Daily Oracle & Horoscopes:** Personalized daily insights, horoscopes, and energy readings based on Vedic principles.
* **Auspicious Timings (Muhurta):** Real-time tracking of Choghadiya, Rahu Kaal, and optimal timings for significant activities.
* **Festival & Ekadashi Tracker:** Comprehensive tracking of major Hindu festivals and Ekadashi dates.
* **Offline First & PWA:** Fully functional offline mode and installable as a Progressive Web App (PWA).
* **Cross-Platform:** Available as a Responsive Web Application and a native Android App.
* **Dark Mode Support:** Beautiful, serene dark theme for comfortable night-time viewing.
* **Bilingual Support:** Sanskrit integrated UI components with localized translations.

---

## 🛠️ Technology Stack & Software Used

Shastra Life is built using a modern, scalable, and highly performant professional tech stack:

### Frontend / Core
* **[Next.js (v14)](https://nextjs.org/)** - The React framework used for server-side rendering, static site generation, and optimized routing.
* **[React (v18)](https://react.dev/)** - The core library for building the dynamic user interface.
* **[TypeScript](https://www.typescriptlang.org/)** - For robust, type-safe code, reducing runtime errors and improving developer experience.
* **[Tailwind CSS (v3)](https://tailwindcss.com/)** - Utility-first CSS framework for rapid, responsive, and beautiful UI development.

### Mobile & Native
* **[Capacitor (v8)](https://capacitorjs.com/)** - Used to package the Next.js web application into a fully native Android mobile application.

### Backend & Analytics
* **[Supabase](https://supabase.com/)** - An open-source Firebase alternative providing the backend database, authentication, and real-time synchronization.
* **[PostHog](https://posthog.com/)** - Used for comprehensive product analytics, session recording, and feature tracking.

### Core Domain Libraries
* **[Astronomy Engine](https://github.com/cosmologicon/astronomy)** & **[SunCalc](https://github.com/mourner/suncalc)** - Crucial for highly accurate, localized astronomical calculations (sunrise, sunset, planetary positions) necessary for an authentic Vedic calendar.

---

## 🚀 Getting Started (Development)

Follow these steps to set up the project locally:

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**
* **Android Studio** (if you intend to build the native Android app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HimanshuRag/Shastra-Calendar-app-.git
   cd Shastra-Calendar-app-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your necessary API keys (Supabase, PostHog, etc.).

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📱 Mobile Build (Android)

To build and sync the application for Android:

1. Build the Next.js production export:
   ```bash
   npm run build
   ```
2. Sync the built web assets with the native Android project:
   ```bash
   npx cap sync
   ```
3. Open the project in Android Studio:
   ```bash
   npm run cap:open
   ```
   *From Android Studio, you can run the app on an emulator or a physical device, and generate signed release APKs/AABs.*

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this project, via any medium, is strictly prohibited.

*Designed with devotion and code.* 🕉️