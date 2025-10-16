# KPaste

Share code and text snippets with syntax highlighting, paste management, and easy sharing. Stores pastes in your PDS for convenience.

## Project Structure

This is a pnpm workspace monorepo:

```
kpaste/
├── apps/
│   └── kpaste/          # Main KPaste application
├── packages/            # Shared packages (for future reusable code)
└── pnpm-workspace.yaml  # Workspace configuration
```

All commands can be run from the root directory and will automatically target the appropriate workspace packages.

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm package manager (v10.17.1 or higher)

### Building

```bash
pnpm install
pnpm build
```

### Devserver

Start the development server:

```bash
pnpm dev
```

Preview production build:

```bash
pnpm preview
```

### Lexicon Management

- `pnpm lex-cli generate -c ./lex.config.js` - Generate TypeScript types from lexicons
- `pnpm publish-lexicon` - Publish lexicon schema to PDS (requires `--handle`, `--password`, optional `--endpoint`)
