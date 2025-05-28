# GitHub Repository Archiver

A command-line tool that allows you to easily archive multiple GitHub repositories at once.

## Features

- List all repositories created by a specific GitHub user (excludes forks)
- List all fork repositories for a specific GitHub user
- Interactive selection interface for choosing which repositories to archive or delete
- Archive multiple repositories in one operation
- Delete multiple fork repositories in one operation
- User-friendly CLI interface with detailed repository information
- Displays repository details including visibility, stars, language, and creation date
- Skip confirmation with `--force` flag
- Detailed success/failure reporting

## Installation

### Option 1: Install from GitHub Packages

This package is published to GitHub Packages. To install it:

1. Authenticate with GitHub Packages:

   Create or edit the `.npmrc` file in your project or home directory:
   ```
   @jamtur01:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

2. Install the package:
   ```
   npm install @jamtur01/gharchive
   ```

### Option 2: Install from Source

1. Clone this repository:

   ```
   git clone https://github.com/jamtur01/gharchive.git
   cd gharchive
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build the project:

   ```
   npm run build
   ```

4. Link the package globally (optional):
   ```
   npm link
   ```

## Configuration

Create a `.env` file in the root directory with your GitHub personal access token:

```
GITHUB_TOKEN=your_github_personal_access_token_here
```

You can create a token at https://github.com/settings/tokens with the `repo` scope.

## Usage

```
gharchive archive <username>
```

For example:

```
gharchive archive octocat
```

## Commands

The tool provides four main commands:

1. **List repositories**:

   ```
   gharchive list <username>
   ```

   Shows all non-forked repositories for a user with detailed information.

2. **List fork repositories**:

   ```
   gharchive list-forks <username>
   ```

   Shows all fork repositories for a user with detailed information.

3. **Archive repositories**:
   ```
   gharchive archive <username>
   ```
   Interactive process to select and archive repositories.
   Use `--force` flag to skip confirmation prompt.

4. **Delete fork repositories**:
   ```
   gharchive delete-forks <username>
   ```
   Interactive process to select and delete fork repositories.
   Use `--force` flag to skip confirmation prompt.
   **Warning**: Deletion cannot be undone.

For example:

```
gharchive list octocat
gharchive list-forks octocat
gharchive archive octocat
gharchive archive octocat --force
gharchive delete-forks octocat
```

This will:

1. Fetch repositories created by the user (non-forked or forks depending on command)
2. Display a checkbox list of repositories with details
3. Allow you to select repositories to archive or delete
4. Ask for confirmation before proceeding (unless using --force)
5. Archive or delete the selected repositories with detailed status reporting

## Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Build and run the application
- `npm start` - Run the compiled application

## CI/CD

This package uses GitHub Actions for continuous integration and deployment. The workflow:

1. Builds and tests the package on every push to the main branch
2. Automatically publishes to GitHub Packages when a new release is created

## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for details on version history and updates.

## License

MIT License

Copyright (c) 2025 James Turnbull <james@ltl.so>

See the [LICENSE](LICENSE) file for details.
