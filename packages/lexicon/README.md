# @kpaste-app/lexicon

ATProto lexicon types for KPaste.

## Installation

```bash
npm install @kpaste-app/lexicon
# or
pnpm add @kpaste-app/lexicon
# or
yarn add @kpaste-app/lexicon
```

## Usage

Import the lexicon types in your application:

```typescript
import * as MoeKarashiiroKpastePaste from "@kpaste-app/lexicon";

// Or import specific types
import { MoeKarashiiroKpastePaste } from "@kpaste-app/lexicon";
import type { Paste } from "@kpaste-app/lexicon/types";
```

### Type Definitions

The package exports TypeScript type definitions for the KPaste lexicon:

- **Paste Record** (`moe.karashiiro.kpaste.paste`): Represents a code/text paste with metadata including title, language, timestamps, and blob content reference.

## Lexicon Schema

The lexicon defines the following record type:

- `moe.karashiiro.kpaste.paste` - A paste record containing:
  - `title` (string, optional) - The paste title
  - `language` (string, optional) - Syntax highlighting language
  - `createdAt` (datetime) - Creation timestamp
  - `updatedAt` (datetime, optional) - Last update timestamp
  - `content` (blob) - The paste content stored as a blob
