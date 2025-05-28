# GitHub Repository Archiver

A command-line tool that allows you to easily archive multiple GitHub repositories at once.

## Features

- List all repositories created by a specific GitHub user (excludes forks)
- Interactive selection interface for choosing which repositories to archive
- Archive multiple repositories in one operation
- User-friendly CLI interface with detailed repository information
- Displays repository details including visibility, stars, language, and creation date
- Skip confirmation with `--force` flag
- Detailed success/failure reporting

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/jamesturnbull/gharchive.git
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

The tool provides two main commands:

1. **List repositories**:

   ```
   gharchive list <username>
   ```

   Shows all non-forked repositories for a user with detailed information.

2. **Archive repositories**:
   ```
   gharchive archive <username>
   ```
   Interactive process to select and archive repositories.
   Use `--force` flag to skip confirmation prompt.

For example:

```
gharchive list octocat
gharchive archive octocat
gharchive archive octocat --force
```

This will:

1. Fetch all non-forked repositories created by the user
2. Display a checkbox list of repositories with details
3. Allow you to select repositories to archive
4. Ask for confirmation before archiving (unless using --force)
5. Archive the selected repositories with detailed status reporting

## Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Build and run the application
- `npm start` - Run the compiled application

## Repository

This project is hosted on GitHub at: https://github.com/jamesturnbull/gharchive

## License

MIT License

Copyright (c) 2025 James Turnbull <james@ltl.so>

See the [LICENSE](LICENSE) file for details.
