# Scripts

Development and deployment scripts for KPaste.

## publish-lexicon.js

Publishes the KPaste lexicon schema to an AT Protocol repository as a `com.atproto.lexicon.schema` record.

### Usage

```bash
# Using npm script (recommended)
pnpm publish-lexicon --handle your.handle --password your-password

# Or directly with node
node scripts/publish-lexicon.js --handle your.handle --password your-password --endpoint https://your-pds.com
```

### Parameters

- `--handle` (required): Your AT Protocol handle (e.g., `alice.bsky.social`)
- `--password` (required): Your password or app password
- `--endpoint` (optional): AT Protocol service endpoint (defaults to `https://bsky.social`)

### Notes

- The script publishes the lexicon with rkey `moe.karashiiro.kpaste.paste`
- Uses `putRecord` so it will overwrite any existing schema with the same rkey
- For accounts with 2FA enabled, use an app password instead of your main password
- The published record can be accessed at `at://your.did/com.atproto.lexicon.schema/moe.karashiiro.kpaste.paste`

### Example

```bash
pnpm publish-lexicon --handle alice.bsky.social --password my-app-password
```

This will publish the lexicon schema to Alice's repository, making it discoverable by other AT Protocol applications.
