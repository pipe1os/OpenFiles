# Contributing to OpenFiles

First off, thank you for considering contributing to OpenFiles! We welcome contributions from everyone. This document provides guidelines for contributing to the project.

## How Can I Contribute?

There are several ways you can contribute:

- **Reporting Bugs:** If you find a bug, please open an issue on GitHub describing the problem, steps to reproduce it, and your environment.
- **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Open an issue to discuss it.
- **Code Contributions:** You can contribute by fixing bugs, implementing new features (especially new conversion types!), or improving the codebase.

## Setting Up Your Development Environment

To contribute code, you'll need to set up a local development environment:

1.  **Prerequisites:**
    - Node.js (Check `.node-version` or `backend/functions/package.json` -> `engines` for the recommended version, currently Node 22).
    - npm (comes with Node.js).
    - Firebase CLI: Install globally (`npm install -g firebase-tools`). Log in (`firebase login`).
    - Git.
2.  **Fork & Clone:** Fork the repository on GitHub and clone your fork locally.
    ```bash
    git clone https://github.com/pipe1os/OpenFiles.git
    cd OpenFiles
    ```
3.  **Install Dependencies:** Install dependencies for both the frontend and the backend functions.

    ```bash
    # Frontend dependencies
    cd frontend
    npm install
    cd ..

    # Backend dependencies
    cd backend/functions
    npm install
    cd ../..
    ```

4.  **Firebase Project Setup (Emulators):** For local development, we primarily use the Firebase Emulators. You don't necessarily need a dedicated Firebase project, but you might need one if you plan extensive testing or deployment.
    - Ensure you have Java installed, as some emulators require it.
    - You might need to select a placeholder project for the emulators: `firebase use --add` (follow prompts, you can create a dummy project or use an existing one).
5.  **Run Emulators:** Start the Firebase emulators for Functions and Storage.
    ```bash
    # From the project root
    firebase emulators:start --only functions,storage
    ```
6.  **Run Frontend:** In a separate terminal, start the frontend development server.
    ```bash
    # From the project root
    cd frontend
    npm run dev
    ```

Now you should be able to access the application locally (usually at `http://localhost:5173` or similar) and interact with the local emulators.

## Code Contribution Guidelines

1.  **Branching:** Create a new branch for your feature or bugfix from the `main` (or `develop` if it exists) branch.
    ```bash
    git checkout main
    git pull origin main # Ensure you have the latest changes
    git checkout -b your-feature-or-bugfix-branch
    ```
2.  **Code Style:** Follow the existing code style (TypeScript, React best practices, Tailwind CSS). Run the linter (`npm run lint` in both `frontend` and `backend/functions` directories) before committing.
3.  **Commit Messages:** Write clear and concise commit messages.
4.  **Pull Requests (PRs):**
    - Push your branch to your fork on GitHub.
    - Open a Pull Request against the main repository's `main` branch.
    - Provide a clear description of the changes in your PR.
    - Link any relevant issues (e.g., `Fixes #123`).
    - Be prepared to discuss your changes and make adjustments based on feedback.

## Adding New Conversion Types

Adding support for new file conversions is a great way to contribute!
Please follow the detailed guide here: [`docs/adding-converters.md`](mdc:docs/adding-converters.md)

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

We look forward to your contributions!
