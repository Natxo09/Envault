# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2026-01-12

### Fixed
- Restore bottom inset margin in main content area

## [0.2.2] - 2026-01-12

### Added
- "You're up to date" message with green checkmark when no updates available
- Periodic update check every 6 hours (when auto-check is enabled)
- Console logging for update errors (visible in DevTools)

### Fixed
- Missing updater permissions that prevented update checks from working

## [0.2.1] - 2026-01-12

### Fixed
- macOS code signing and notarization for Gatekeeper compatibility

## [0.2.0] - 2026-01-12

### Added
- **Auto-Update System**: Automatic update detection and installation via GitHub Releases
  - Background check for updates on startup (configurable)
  - Update notification with download progress
  - One-click install and restart
  - Manual "Check for Updates" button in Settings
- **Updates Section in Settings**: View current version and check for updates
- Signed releases for secure update verification

### Changed
- App name now displays as "Envault" (capitalized) consistently across all platforms

## [0.1.1] - 2026-01-12

### Added
- Logo and screenshot to README
- Auto-publish releases CI workflow

## [0.1.0] - 2026-01-12

### Added
- **Project Management**: Add, edit, and delete projects with custom icons and colors
- **Environment Files**: Scan, view, and activate `.env` files with keyboard navigation
- **Settings Dialog**: Theme selector (Light/Dark/System) and keyboard shortcuts configuration
- **Keyboard Navigation**: Full keyboard support with customizable shortcuts
  - `Cmd/Ctrl+N`: Add new project
  - `Cmd/Ctrl+,`: Open settings
  - `Cmd/Ctrl+B`: Toggle sidebar
  - `Arrow keys` / `J/K`: Navigate lists
  - `A`: Activate environment
  - `Cmd/Ctrl+C`: Copy file content
  - `Cmd/Ctrl+R`: Refresh files
- **Toast Notifications**: Visual feedback for actions (can be toggled in settings)
- **Smooth Refresh**: Animation and selection preservation when refreshing
- **Context Menu**: Right-click on projects for quick actions
- **Cross-platform Support**: macOS, Windows, and Linux builds

### Fixed
- Theme keyboard navigation and category titles in settings
- Small window behavior and scrolling
- Focus index sync on click with improved UI feedback
- Flickering when navigating and selecting env files

### Infrastructure
- GitHub Actions workflows for CI and releases
- SQLite database with migrations for project persistence
- Tauri commands for project and env file management

[0.2.3]: https://github.com/Natxo09/envault/releases/tag/v0.2.3
[0.2.2]: https://github.com/Natxo09/envault/releases/tag/v0.2.2
[0.2.1]: https://github.com/Natxo09/envault/releases/tag/v0.2.1
[0.2.0]: https://github.com/Natxo09/envault/releases/tag/v0.2.0
[0.1.1]: https://github.com/Natxo09/envault/releases/tag/v0.1.1
[0.1.0]: https://github.com/Natxo09/envault/releases/tag/v0.1.0
