# Changelog

All notable changes to the GitHub Repository Archiver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-05-28

### Added
- New `list-forks` command to list fork repositories for a specific GitHub user
- New `delete-forks` command to interactively select and delete fork repositories
- Function to fetch only fork repositories
- Improved repository selection with customizable messages

### Changed
- Renamed `ArchiveResult` interface to `OperationResult` for better reusability
- Updated CLI help text to include version number in description
- Enhanced documentation with information about new fork-related commands
- Updated README with comprehensive command examples

## [1.0.1] - 2025-05-27

### Fixed
- Updated Node.js version requirement to >=20.0.0 in package.json
- Updated GitHub Actions workflow to use Node.js 20
- Updated GitHub Actions from v3 to v4
- Fixed npm packaging warnings

## [1.0.0] - 2025-05-25

### Added
- Initial release
- Command to list non-forked repositories for a GitHub user
- Command to archive selected repositories
- Interactive repository selection interface
- Support for environment variables via dotenv
- Detailed success/failure reporting