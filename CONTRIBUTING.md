# Contributing to PIVOTHEAD

We welcome and appreciate your contribution to Pivothead. These guidelines will help ensure a smooth and collaborative process for everyone.

## How Can You Contribute?

Here are some ways you can contribute to the project:

- Reporting bugs or issues
- Submitting feature requests
- Writing or improving documentation
- Fixing bugs
- Implementing new features

## Steps for Contributing

1. **Fork** the repository to your GitHub account.

2. **Clone** the forked repository to your local machine.

3. Create a new **branch** for your feature | bug | fixes | hotFixes |docs | other: `git checkout -b <feature|bug|fixes|hotFixes|docs|other>/<issueNumber/ticketNumber>`.check [branching guidelines](./BRANCHING.md).

4. **Make changes** and **test** to ensure they work as expected.

5. **Commit** your changes: `git commit -m 'feat:[<issueNumber/ticketNumber>] Your descriptive commit message'` . check [commit message guidelines](./COMMIT_MESSAGE.md).

6. **Push** your branch to your GitHub repository: `git push origin feature/<issueNumber/ticketNumber>-<description>`.

7. Create a **Pull Request (PR)** from your branch to the original repository's `main` or `master` branch.

## Setting up Husky for Git Hooks

Husky is used for running pre-commit checks and enforcing commit message conventions. Follow these steps to set up Husky in the project:

1. Install Husky: After cloning the repository, install the project dependencies by running: `pnpm install`

2. Enable Husky Hooks:
   Once dependencies are installed, enable Git hooks with Husky: `pnpm husky install`

3. Verify Husky Setup:
   After Husky is installed, you can test the hooks by making a commit.For more refer [husky](https://typicode.github.io/husky/get-started.html)

## Pull Request Guidelines

- Make sure your PR addresses an issue or feature request.
- Describe your PR and provide context in the description.
- Keep your PR focused on a single change to make reviewing easier.
- Ensure your code follows the project's coding style and conventions.

## Code of Conduct and Licensing

Please ensure your contributions adhere to the project's [Code of Conduct](./CODE_OF_CONDUCT.md) and are licensed under the project's [License](./LICENSE).

## Need Help?

If you need further clarification or help, feel free to reach out by creating an issue or directly contacting the maintainers.

Thank you for your interest in contributing to pivot head! We appreciate your efforts in making this project better.

Happy contributing!
