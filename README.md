# Sander-Catering Onepager

This repository contains the source code for the **Sander-Catering Onepager** website.

## 🏗 Architecture

The project is structured into two main parts: a frontend powered by Astro, and a backend powered by Grav CMS.

### 1. Frontend (`/frontend`)

- **Framework:** [Astro](https://astro.build/) - A modern, fast website builder.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **Interactivity & 3D:** Contains React, Three.js, and React Three Fiber (R3F) for advanced WebGL features like the interactive Hero spotlight effect.
- **Animations:** Custom CSS and potentially Framer Motion or GSAP for smooth scroll and viewport animations.

### 2. Backend (`/cms`)

- **CMS:** [Grav CMS](https://getgrav.org/) - A fast, flexible, flat-file content management system.
- **Purpose:** Used as a headless CMS to manage the content (text, images, settings like WebGL blur values, etc.) for the Astro frontend.
- **Integration:** The Astro frontend fetches content from Grav CMS (e.g., via the `grav.ts` utility) to statically generate or server-side render the pages.

## 🚀 Getting Started

### Prerequisites

- Node.js (for Astro frontend)
- PHP (for Grav CMS backend)
- Composer (optional, for Grav dependencies)

### Installation & Running Locally

The project uses two separate servers during development.

**1. Start the Grav CMS Backend:**

```bash
cd cms
php -S localhost:8000 system/router.php
# Or use the specific development command configured for this project
```

**2. Start the Astro Frontend:**
Open a new terminal window/tab:

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically run on `http://localhost:4321` and communicate with the local Grav CMS instance.

## 🛠 Tech Stack Details

- **Astro Components (`.astro`):** Used for layout, static structure, and fetching data from Grav.
- **React Components (`.tsx` / `.jsx`):** Used inside Astro for highly interactive client-side logic (like the `WebGLBackground.jsx`).
- **Figma Integration:** The design tokens, components (like Site Header, Smart Catering Accordions), and layout spacing are tightly integrated with the corresponding Figma designs.

## 📦 Building for Production

To build the frontend for production:

```bash
cd frontend
npm run build
```

This will generate the static files in the `frontend/dist` directory, which can be deployed to any static hosting provider. The Grav CMS might need to be hosted separately depending on the deployment strategy (static generation vs. SSR).
