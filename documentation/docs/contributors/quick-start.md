---
sidebar_position: 4
---

# Quick Start Guide

Get started with our monorepo setup in 5 minutes.

## 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/mindfiredigital/reponame.git
cd PivotHead

# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

## 2. Development Workflow

```bash
# Start development environment
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## 3. Making Changes

1. Create a new branch:

```bash
git checkout -b feature/your-feature
```

2. Make your changes

3. Commit using conventional commits:

```bash
git commit -m "feat(core): add new feature"
# or
git commit -m "fix(react): fix bug"
```

4. Push and create a PR:

```bash
git push origin feature/your-feature
```

## 4. Publishing

The release process is automated through GitHub Actions. When your PR is merged:

1. A changeset will be automatically generated
2. A new version will be created
3. Packages will be published to npm

## Need Help?

- Check the full [Monorepo Setup Guide](./monorepo-setup.md)
- Open an issue on GitHub
- Contact the team
