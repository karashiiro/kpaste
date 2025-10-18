## Development

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
