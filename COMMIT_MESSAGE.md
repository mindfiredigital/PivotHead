# Commit Messages

Commit messages are a crucial aspect of version control and collaboration in software development. Well-structured commit messages enhance codebase maintainability and collaboration among team members. This document provides guidelines for writing clear and concise commit messages.

## General Principles

- Each commit message should have a clear and specific purpose.
- Use the present tense ("Add feature" rather than "Added feature").
- Keep commit messages concise and to the point.

## Structure of a Commit Message

A commit message typically consists of three parts:

1.  **Header:** This is a one-line summary of the commit.

2.  **Body (optional):** Provides more detailed information about the changes made. Not all commits require a body.

3.  **Footer (optional):** Contains any metadata related to the commit, such as issue tracker references.

Here's a template for structuring commit messages:

```markdown
<type>: <subject>

<body  (optional)>
<footer  (optional)>
```

## Type

The `<type>` should describe the purpose or category of the commit. Common types include:

- `feat`: A new feature added to the codebase.
- `fix`: A bug fix.
- `docs`: Documentation-related changes.
- `style`: Code style and formatting changes (no functional code changes).
- `refactor`: Code refactoring without adding new features or fixing bugs.
- `test`: Adding or modifying tests.
- `chore`: Routine tasks, maintenance, or tooling changes.
- `patch`: Indicates general maintenance tasks that don't fit into feature or bug fix categories but still need to be tracked and reviewed separately

## Subject

The `<subject>` is a concise description of the commit. It should be clear and specific. Begin with a capital letter and do not end with a period.

Examples:

- `feat:[issueNumber/ticketNumber] Add user registration endpoint`
- `fix:[issueNumber/ticketNumber] Resolve issue with login validation`
- `MERGE:[issueNumber/ticketNumber] Merged xyz to development`

NOTE: First letter of subject should be capital.

Example

- Add user registration endpoint - ✅ Valid
- add user registration endpoint - ❌ Invalid

## Body

The `<body>` provides more detailed information about the changes made in the commit. It is optional but recommended for complex changes or when additional context is necessary.

## Footer

The `<footer>` can include metadata, such as references to issue trackers, and should be used sparingly.

## Examples

- **New Feature**

```shell
###✅ feat:[27] Implement chat functionality
This commit adds the ability for users to send and receive chat messages in real-time. It includes both server and client-side code, as well as necessary database schema changes. A WebSocket-based communication system has been integrated to achieve this.
```

- **Bug Fix**

```shell
###✅ fix:[12] Resolve CSS alignment issue on the homepage
The homepage had a problem with elements not aligning properly on smaller screens. This commit fixes the issue by adjusting the CSS rules for responsive design, ensuring that the page displays correctly on all devices.
```

## Additional Tips

- Use imperative mood in the subject. Start with a verb (e.g., "Add," "Fix," "Update") to describe what the commit does.

- Keep commits small and focused on a single task or logical change.

- Reference related issues, pull requests, or other relevant information in the commit message body or footer.

## References

- [**Conventional Commits 1.0.0**](https://www.conventionalcommits.org/en/v1.0.0/)
