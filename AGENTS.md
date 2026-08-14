# PathForge contributor guide

## Product goal

PathForge is an explainable career navigator. It maps a person's current skills to a target
technology role, then uses CognoDB graph connections to explain gaps, learning paths, portfolio
projects, and nearby roles. Production data must come from the API and CognoDB—never from mock
success responses.

## Layout

- `client/`: React, Vite, Tailwind, and Cytoscape user interface.
- `server/`: Express API, Neo4j driver integration, parameterized Cypher, and seed data.
- `docs/`: submission assets and manual capture checklists.
- `.github/workflows/`: credential-free continuous integration.

## Commands

- `npm run dev`: run both workspaces.
- `npm run build`: build the client, then the server.
- `npm run lint`: lint both workspaces.
- `npm run typecheck`: run strict TypeScript checks.
- `npm test`: run tests without a live database.
- `npm run verify`: lint, typecheck, test, and build.
- `npm run seed`: idempotently load CognoDB after `server/.env` is configured.
- `npm start`: run the compiled production server.

## Engineering conventions

- Keep TypeScript strict; prefer explicit domain DTOs at API and database boundaries.
- Keep components and services focused, test business transformations, and avoid unnecessary
  abstractions or dependencies.
- Use stable slugs and public IDs (`Label:slug`); normalize Neo4j integers before JSON output.
- Every dynamic Cypher value must be passed as a query parameter. Never interpolate input into
  Cypher. Bound variable-length traversals and result sizes, and close sessions in `finally`.
- Preserve the direction `prerequisite-[:PREREQUISITE_FOR]->dependent` and avoid cycles.
- Keep CognoDB credentials server-only and environment-based. Never log, commit, or send secrets to
  the client. Keep `.env.example` placeholders non-secret.
- Validate external input, use safe production errors, and distinguish `not_configured` from an
  unavailable database. Never make the production UI pretend a failed database request succeeded.

Before handing off a change, run `npm run verify`. Tests and CI must not require CognoDB credentials.
