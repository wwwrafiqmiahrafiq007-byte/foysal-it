# Repository Cleanup Plan

## Current finding

The repository currently mixes source-like TypeScript files with `.rar`/`.zip` archives at the repository root. This makes the project harder to navigate, review, test and deploy.

## Target state

The repository should contain the real application source tree, not packaged source archives.

```text
foysal-it/
├── .github/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── agents/
│   ├── ai/
│   ├── auth/
│   ├── billing/
│   ├── db/
│   ├── integrations/
│   ├── permissions/
│   ├── security/
│   ├── services/
│   ├── validators/
│   ├── workflows/
│   └── types/
├── drizzle/
├── tests/
├── package.json
├── tsconfig.json
├── next.config.*
├── .env.example
└── README.md
```

## Cleanup rules

1. Extract the authoritative application source from the submitted archive.
2. Compare duplicate files before choosing the canonical copy.
3. Move application code into `src/` according to responsibility.
4. Move static assets into `public/`.
5. Move database schema/migrations into `drizzle/` or the project's established DB directory.
6. Remove duplicate packaged source archives after their contents are verified.
7. Remove generated build output and local-only files.
8. Keep documentation in `docs/` and link it from the README.
9. Run lint, typecheck, tests and build after the move.
10. Make cleanup in small commits so every move can be reviewed or reverted.

## Do not do

- Do not rewrite the UI from scratch during repository cleanup.
- Do not delete an archive until its contents have been compared with the canonical source.
- Do not commit secrets or `.env.local`.
- Do not silently change database semantics while only reorganizing files.
