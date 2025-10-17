# @kpaste-app/lexicon

ATProto lexicon types for KPaste - a code and text snippet sharing application built on the AT Protocol.

## Installation

```bash
npm install @kpaste-app/lexicon
# or
pnpm add @kpaste-app/lexicon
# or
yarn add @kpaste-app/lexicon
```

## Usage

Import the lexicon types in your ATProto application:

```typescript
import * as MoeKarashiiroKpastePaste from "@kpaste-app/lexicon";

// Or import specific types
import { MoeKarashiiroKpastePaste } from "@kpaste-app/lexicon";
import type { Paste } from "@kpaste-app/lexicon/types";
```

### Type Definitions

The package exports TypeScript type definitions for the KPaste paste lexicon:

- **Paste Record** (`moe.karashiiro.kpaste.paste`): Represents a code/text paste with metadata including title, language, timestamps, and blob content reference.

## Lexicon Schema

The lexicon defines the following ATProto record type:

- `moe.karashiiro.kpaste.paste` - A paste record containing:
  - `title` (string, optional) - The paste title
  - `language` (string, optional) - Syntax highlighting language
  - `createdAt` (datetime) - Creation timestamp
  - `updatedAt` (datetime, optional) - Last update timestamp
  - `content` (blob) - The paste content stored as a blob

## Development

This package is part of the [KPaste monorepo](https://github.com/karashiiro/kpaste).

### Generating Types

When lexicon schemas are updated, regenerate TypeScript types:

```bash
pnpm generate
```

This runs `lex-cli generate` using the configuration in `lex.config.js`.

## Cutting Releases

This package is published automatically via GitHub Actions when a new tag is pushed. To cut a new release:

1. **Update the version** in `package.json`:

   ```bash
   cd packages/lexicon
   # Edit package.json and bump version (e.g., 1.0.0 → 1.1.0)
   ```

2. **Regenerate types** (if lexicon schemas changed):

   ```bash
   pnpm generate
   ```

3. **Commit your changes**:

   ```bash
   git add .
   git commit -m "chore(lexicon): bump version to 1.1.0"
   ```

4. **Create and push a tag**:

   ```bash
   git tag lexicon-v1.1.0
   git push origin main --tags
   ```

5. **GitHub Actions will automatically**:
   - Build the package
   - Publish to npm
   - Create a GitHub release

### Versioning

This package follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes to lexicon schema
- **Minor** (1.0.0 → 1.1.0): New fields or backward-compatible changes
- **Patch** (1.0.0 → 1.0.1): Bug fixes or documentation updates

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- [KPaste Repository](https://github.com/karashiiro/kpaste)
- [AT Protocol](https://atproto.com/)
- [ATCute](https://github.com/mary-ext/atcute) - The ATProto client library used by KPaste
