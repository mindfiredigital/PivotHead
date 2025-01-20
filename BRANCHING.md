# Branching Strategy

## Branch Types

- **main**: Production-ready code.
- **development**: Integration branch for features and bug fixes.
- **feature/\***: New features.
- **bug/\***: Bug fixes.
- **hotfix/\***: Critical fixes.
- **fixes/\***: General fixes that do not need to be immediately addressed.
- **docs/\***: Documentation-related changes (e.g., README updates, new docs).
- **other/\***: For any other changes that do not fall into the above categories.
- **enhancement/\***: Indicates improvements that are not categorized as features or bug fixes.
- **patch/\***: Indicates general maintenance tasks that don't fit into feature or bug fix categories but still need to be tracked and reviewed separately

## Naming Convention

Branches should follow the format:
Format: `<type>/<issue-id>-<description>`
Example: `feature/12345-add-login-button`

## Merge Strategy

- Use pull requests for all merges.
- Code must be reviewed and approved before merging to `main` or `development`.

## Commit Messages

Format: `<type>:[<issue-id>] <description>`
Example: `feat:[12345] Add login button`

## Conflict Resolution

1. Pull the latest changes from the base branch.
2. Resolve conflicts locally.
3. Rebase the branch and push changes.

For more details,feel free to reach out by creating an issue or directly contacting the maintainers.
