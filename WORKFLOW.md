# WeGrow Care - Application Workflow

This document outlines both the **User Journey Workflow** and the **Development Workflow** for the WeGrow Care application.

## 1. User Journey Workflow (UX)

The application is designed to provide a seamless, dual-mode experience for booking home healthcare services.

### Phase 1: Onboarding & Accessibility Selection
1. **Welcome Screen (`/`)**: User arrives at the landing page.
2. **Mode Selection**: User chooses their preferred UI experience:
   - **Modern & Dynamic**: A premium, flashy SaaS-like interface with smooth animations and glassmorphism.
   - **Clear & Comforting**: An accessible, high-contrast, large-text interface designed for seniors or visually impaired users.

### Phase 2: Exploration
1. **Home Dashboard (`/app`)**: User views the main dashboard featuring quick actions, upcoming appointments, and featured services.
2. **Services List (`/app/services`)**: User browses available healthcare services (e.g., Nursing, Physical Therapy).
3. **Service Details (`/app/services/:id`)**: User views in-depth information about a specific service, pricing, and clinician details.

### Phase 3: The Booking Pipeline (`/app/booking`)
The booking process is a linear, 3-step wizard with a persistent summary pane (in Modern mode):
1. **Step 1: Service & Schedule**: User selects the specific clinical service, preferred date, and time slot.
2. **Step 2: Patient Details**: User provides their legal name, contact number, and email address.
3. **Step 3: Clinical Notes & Location**: User provides the service address and any optional medical notes.
4. **Submission**: User clicks "Confirm Booking". The system processes the request (simulated API call).

### Phase 4: Confirmation
1. **Confirmation Screen (`/app/confirmation`)**: User receives a success message, booking reference number, and next steps.

---

## 2. Development & Deployment Workflow

### Local Development
1. **Install Dependencies**: `npm install`
2. **Run Development Server**: `npm run dev` (Starts Vite server on port 3000)
3. **Linting**: `npm run lint` (Checks for TypeScript and ESLint errors)

### CI/CD Pipeline (GitHub Actions)
A GitHub Actions workflow is included in `.github/workflows/ci.yml`.
- **Trigger**: Pushes or Pull Requests to the `main` or `master` branch.
- **Process**:
  1. Checks out the code.
  2. Sets up Node.js (v18 and v20).
  3. Installs dependencies (`npm ci`).
  4. Runs the linter to ensure code quality.
  5. Builds the production assets (`npm run build`).

### Production Build
1. **Build**: `npm run build` compiles the React application and outputs static files to the `dist/` directory.
2. **Deploy**: The contents of the `dist/` directory can be hosted on any static hosting provider (Vercel, Netlify, Firebase Hosting, GitHub Pages, or an Nginx server).
