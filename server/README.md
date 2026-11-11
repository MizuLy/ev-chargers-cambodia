# Express Feature-Based Starter

A reusable Express 5 and Prisma folder-structure starter for building modular Node.js APIs.

## Purpose

Use this repository as a starting point for new backend projects. It provides the dependency setup, feature-oriented source folders, Prisma configuration, environment template, and development scripts. The application files are intentionally minimal so each project can add only the features it needs.

## Tech Stack

- Node.js with CommonJS modules
- Express 5
- Prisma 6 with PostgreSQL
- Zod for validation
- JWT and bcrypt for authentication utilities
- Morgan, CORS, rate limiting, Multer, and Cloudinary integrations

## Folder Structure

```text
src/
|-- configs/       Application configuration
|-- libs/          Shared clients and integrations
|-- middlewares/   Express middleware
|-- modules/       Feature modules
|-- routes/        Route registration
|-- utils/         General helpers
|-- app.js         Express application setup
`-- server.js      Server entry point
tests/
|-- unit/          Unit tests
`-- integration/   API and integration tests
docs/              Project documentation
prisma/
`-- schema.prisma  Database schema
```

Keep feature-specific code inside `src/modules/`. Put shared concerns in the corresponding top-level folder rather than coupling them to one feature.

Git tracks files, not empty directories. The `docs/`, `tests/unit/`, and `tests/integration/` folders will not appear in a remote repository until they contain a file, such as documentation, a test, or a `.gitkeep` placeholder.

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL, when using Prisma-backed features

### Create a Project from This Starter

1. Copy or clone this repository into a new project directory.
2. Install dependencies and generate the Prisma client:

   ```bash
   npm install
   npx prisma generate
   ```

3. Copy `.env.example` to `.env` and fill in project-specific values, including `DATABASE_URL` when needed.
4. Add your first feature under `src/modules/` and register its routes in `src/routes/`.

For a configured PostgreSQL database, create development migrations with:

```bash
npx prisma migrate dev
```

## Development Commands

```bash
npm start       # Run the server
npm run dev     # Run with automatic restarts
```

The current `npm test` script is a placeholder because no test framework has been selected yet.

The test directories are reserved for future unit and integration tests. When tests are added, update the `test` script in `package.json` to run the selected test framework.

## Security

Never commit `.env`, database credentials, tokens, or uploaded asset secrets. Keep reusable defaults in `.env.example` and deployment-specific values in environment variables.
