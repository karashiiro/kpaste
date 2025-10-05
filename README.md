# KPaste

Share code and text snippets with syntax highlighting, paste management, and easy sharing. Stores pastes in your PDS for convenience.

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm package manager

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
