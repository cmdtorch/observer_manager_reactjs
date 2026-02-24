# Observer Manager Admin Panel

React 18 admin frontend for the Observer Manager API.

## Requirements
- Node.js 18+
- npm 9+

## Setup
1. Install dependencies:

```bash
npm install
```

2. Create `.env` (optional):

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_USERNAME=admin
VITE_API_PASSWORD=supersecret

# Optional: enable external links in org detail
VITE_GRAFANA_BASE_URL=https://grafana.example.com
VITE_GLITCHTIP_BASE_URL=https://glitchtip.example.com
```

3. Run the app:

```bash
npm run dev
```

## Authentication
- Uses HTTP Basic Auth.
- Credentials are stored in `localStorage` (base64 encoded).
- If no credentials are present, the login modal appears on first load.
- A 401 response clears credentials and re-opens the modal.

## Scripts
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint the codebase
