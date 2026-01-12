# Envault

A lightweight desktop application for managing environment files across your projects. Built with Tauri, React, and Rust.

## Overview

Envault helps developers manage multiple `.env` files across different projects. It provides a clean interface to view, switch between, and organize environment configurations without manually copying files or editing symlinks.

### Key Features

- **Project Management**: Add and organize multiple projects with custom icons and colors
- **Environment Scanning**: Automatically detects all `.env` files in your project directories
- **Quick Switching**: Activate different environment files (`.env.local`, `.env.production`, etc.) with a single click
- **File Viewer**: View environment file contents with syntax highlighting
- **Keyboard Navigation**: Full keyboard support for efficient workflow
- **Native Performance**: Built with Tauri for minimal resource usage
- **Cross-Platform**: Works on macOS, Windows, and Linux

## Screenshots

*Coming soon*

## Installation

### Download

Download the latest release for your platform from the [Releases](https://github.com/Natxo09/envault/releases) page.

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+ or v22.12+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

#### Steps

1. Clone the repository:

```bash
git clone https://github.com/Natxo09/envault.git
cd envault
```

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
npm run tauri dev
```

4. Build for production:

```bash
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Usage

### Adding a Project

1. Click "Add Project" in the sidebar or press `Cmd/Ctrl + N`
2. Select a project directory
3. Customize the project name, icon, and color
4. Click "Add"

### Managing Environments

- Select a project to view its environment files
- Click on any `.env` file to view its contents
- Press `A` or use the context menu to activate an environment
- The active environment will be symlinked to `.env`

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Project | `Cmd/Ctrl + N` |
| Open Settings | `Cmd/Ctrl + ,` |
| Toggle Sidebar | `Cmd/Ctrl + B` |
| Navigate Projects | `Arrow Up/Down` or `J/K` |
| Select Project | `Enter` |
| Switch to Env List | `Tab` |
| Activate Environment | `A` |
| Refresh Files | `Cmd/Ctrl + R` |
| Copy File Content | `Cmd/Ctrl + C` |

## Tech Stack

### Frontend

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

### Backend

- [Tauri 2](https://v2.tauri.app/)
- [Rust](https://www.rust-lang.org/)
- [SQLite](https://www.sqlite.org/) (via rusqlite)

## Project Structure

```
envault/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities
├── src-tauri/              # Tauri backend
│   ├── src/
│   │   ├── commands.rs     # Tauri commands
│   │   ├── database.rs     # SQLite operations
│   │   └── types.rs        # Type definitions
│   └── Cargo.toml
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes following the code style:
   - Use TypeScript strict mode
   - Avoid using `any` type
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages

4. Test your changes:

```bash
npm run build
npm run tauri dev
```

5. Submit a pull request

### Commit Message Format

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

Examples:

```
feat(projects): add project duplication feature
fix(env-files): resolve scanning issue on Windows
docs: update installation instructions
```

## Development

### Running Tests

```bash
# Frontend
npm run build

# Backend
cd src-tauri
cargo test
```

### Code Style

The project uses:

- ESLint and TypeScript for frontend code quality
- Rustfmt for Rust code formatting

## Roadmap

- [ ] Environment variable diff view
- [ ] Search across all environment files
- [ ] Environment templates
- [ ] Import/export configurations
- [ ] Encrypted secrets support

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Tauri](https://tauri.app/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for UI component patterns
- All contributors and users
