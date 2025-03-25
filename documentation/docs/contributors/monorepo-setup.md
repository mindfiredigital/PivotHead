---
sidebar_position: 3
---

# Monorepo Setup Guide

This guide explains how to set up and manage a monorepo using pnpm workspaces, Turborepo, and Changesets.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Package Management with pnpm](#package-management-with-pnpm)
- [Build System with Turborepo](#build-system-with-turborepo)
- [Version Management with Changesets](#version-management-with-changesets)
- [Continuous Integration](#continuous-integration)

## Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Install Node.js (v12 or higher)
# Install pnpm globally
npm install -g pnpm

# Required package dependencies
pnpm add -D @changesets/changelog-github @changesets/cli @commitlint/cli @commitlint/config-conventional turbo
```

These packages are essential for the monorepo setup:

- `@changesets/changelog-github` and `@changesets/cli` manage version control and changelog generation
- `@commitlint/cli` and `@commitlint/config-conventional` enforce commit message conventions
- `turbo` provides the build system for managing dependencies between packages

## Project Structure

Our monorepo follows this structure:

```
root/
├── .changeset/
├── .github/
├── packages/
│   ├── core/
│   ├── react/
│   ├── angular/
│   ├── vue/
│   └── web-component/
├── examples/
├── documentation/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Package Management with pnpm

### Setting Up pnpm Workspaces

1. Create a `pnpm-workspace.yaml` file in your root directory:

```yaml
packages:
  - 'packages/*'
  - 'examples/*'
```

2. Configure your root `package.json`:

```json
{
  "name": "@mindfiredigital/pivothead-table",
  "private": true,
  "workspaces": ["packages/*", "examples/*"],
  "scripts": {
    "build": "turbo run lint && turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "preinstall": "npx only-allow pnpm"
  }
}
```

### Installing Dependencies

```bash
# Install dependencies across all packages
pnpm install

# Add a dependency to a specific package
pnpm add <package> --filter @mindfiredigital/package-core
```

## Build System with Turborepo

### Configuring Turborepo

Create a `turbo.json` in your root directory:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

### Running Tasks

```bash
# Build all packages
pnpm turbo run build

# Build specific packages
pnpm turbo run build --filter=@mindfiredigital/package-core...
```

## Version Management with Changesets

### Setup Changesets

1. Install changesets:

```bash
pnpm add -D @changesets/cli @changesets/changelog-github
```

2. Configure changesets in `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.5/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "mindfiredigital/Package" }
  ],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Managing Versions

1. Create a changeset:

```bash
pnpm changeset
```

2. Commit format for automatic changeset generation:

```bash
# For new features
git commit -m "feat(core): add new table feature"

# For bug fixes
git commit -m "fix(react): resolve rendering issue"

# For breaking changes
git commit -m "BREAKING CHANGE: complete API redesign"
```

### Commit Lint Configuration

We use commitlint to enforce commit message conventions. Here's our `commitlint.config.cjs`:

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['core', 'react', 'web-component', 'angular', 'docs', 'release'],
    ],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
  },
  ignores: [message => message.includes('[skip-commitlint]')],
};
```

## Continuous Integration

### GitHub Actions Workflow

Our release workflow (`.github/workflows/release.yml`) handles automatic versioning and publishing:

```yaml
name: Deployment Workflow PivotHead

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    name: '@mindfiredigital/pivothead'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
      pull-requests: write
      actions: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Enable Corepack
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm turbo run build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1.4.1
        with:
          commit: 'chore(release): version packages'
          title: 'chore(release): version packages'
          version: node .github/changeset-version.js
          publish: npx changeset publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Automatic Changeset Generation

We use a custom script (`.github/changeset-autogenerate.mjs`) to automatically generate changesets from commit messages:

```javascript
// This script automatically creates changesets based on commit messages
import { execSync } from 'child_process';
import fs from 'fs';

// Get the most recent commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();

// Define valid scopes
const validScopes = [
  'core',
  'react',
  'angular',
  'vue',
  'svelte',
  'web-component',
];

// Define regex patterns
const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  minor: /^feat\(([^)]+)\): (.+)/,
  patch: /^fix\(([^)]+)\): (.+)/,
};

// Identify type, package, and description
let packageScope = null;
let changeType = null;
let description = null;

if (commitPatterns.major.test(commitMessage)) {
  changeType = 'major';
  description = commitMessage.match(commitPatterns.major)?.[1];
} else if (commitPatterns.minor.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.minor)?.[1];
  if (validScopes.includes(scope)) {
    changeType = 'minor';
    packageScope = scope;
    description = commitMessage.match(commitPatterns.minor)?.[2];
  }
} else if (commitPatterns.patch.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.patch)?.[1];
  if (validScopes.includes(scope)) {
    changeType = 'patch';
    packageScope = scope;
    description = commitMessage.match(commitPatterns.patch)?.[2];
  }
}

// Generate and write changeset if valid package found
if (packageScope) {
  packageScope = packageScope.trim();
  description = description?.trim() || 'No description provided.';

  // Determine the full package name based on scope
  const packageName =
    packageScope === 'core'
      ? '@mindfiredigital/pivothead'
      : `@mindfiredigital/pivothead-${packageScope}`;

  // Generate changeset content
  const changesetContent = `---
  '${packageName}': ${changeType}
  ---
  ${description}
  `;

  // Write to a changeset file
  fs.writeFileSync(`.changeset/auto-${Date.now()}.md`, changesetContent);
  console.log(`✅ Changeset file created for package: ${packageName}`);
} else {
  console.log(
    '⚠️ No valid package scope found in commit message. Valid scopes are: core, react, angular, vue, svelte, web-component'
  );
}
```

We use a script (`.github/changeset-version.js`) to automatically updtate the versions:

```javascript
// This script automatically updates the versions of package
const { exec } = require('child_process');

exec('npx changeset version');
exec('npm install');
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode
pnpm dev

# Create a changeset
pnpm changeset

# Publish packages
pnpm release

# Clean build artifacts
pnpm clean
```

## Best Practices

1. **Commit Messages**: Always follow the conventional commit format:

   - `feat(scope): message` for features
   - `fix(scope): message` for bug fixes
   - `BREAKING CHANGE: message` for breaking changes

2. **Package Versioning**: Let changesets handle version bumps automatically.

3. **Dependencies**:

   - Use `pnpm add` with the `--filter` flag to add package-specific dependencies
   - Use workspace protocols for internal dependencies

4. **Build Pipeline**:
   - Ensure all packages define their build dependencies correctly in `turbo.json`
   - Use the `--filter` flag with Turbo for targeted builds

## Troubleshooting

Common issues and solutions:

1. **pnpm install fails**:

   - Clear pnpm store: `pnpm store prune`
   - Delete node_modules: `pnpm clean`

2. **Turbo cache issues**:

   - Clear Turbo's cache: `pnpm turbo clean`

3. **Changeset conflicts**:
   - Remove .changeset directory
   - Regenerate changesets: `pnpm changeset:autogenerate`

## Additional Resources

- [pnpm Documentation](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Changesets Documentation](https://github.com/changesets/changesets)
