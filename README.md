# Aghs Labs frontend

Vue 3 and Tailwind CSS frontend for the sibling `AghsLabsApi` Spring Boot project.

## Run locally

Use Node.js 20 or newer. This project uses Vite 6 so it also runs on the currently installed Node 20.12.x. Start the backend on port 8080, then:

```powershell
cd C:\Users\lucas\Documents\apps\AghsLabs\AghsLabsFE
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` requests to `http://localhost:8080`. To use a different backend, copy `.env.example` to `.env` and set `VITE_API_TARGET`. For a production deployment, set `VITE_API_BASE_URL` to the externally accessible backend URL or proxy `/api` at your web server.

## Available pages

- **Home:** search by numeric match ID.
- **Match dashboard:** `/matches/details/{matchId}` with the winner highlighted first, score, duration, game mode, both teams, hero portraits, final item builds, and a ranked section for items repeated across the match. MVP ranking is a frontend estimate based on kills, assists, deaths, and hero damage.
- **Heroes:** `/heroes` with name and primary attribute filters.
- **Pro players & accounts:** lookup by `/player/{playerId}` with `/matches/{playerId}/recent` and `/matches/{playerId}/winLose`. The backend has no pro-player directory route.
- **Tournaments:** informative empty state until a tournament endpoint is added to the backend.

Hero and item image paths returned by the API are resolved against Valve's Steam CDN. The custom battlefield background is stored locally at `public/images/battlefield.png`.

The site fonts are bundled in `public/fonts` with their license notices, so no Google Fonts request is needed at runtime. Radiant highlights use Macondo Swash Caps, and Dire highlights use Metal Mania.
