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
