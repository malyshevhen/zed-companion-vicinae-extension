# GEMINI.md

## Project Overview

This is a [Vicinae](https://vicinaehq.com/) extension that acts as a companion for the [Zed](https://zed.dev/) code editor. It allows users to open files and projects in Zed directly from Vicinae and provides a searchable list of recent Zed projects.

The extension is written in TypeScript and uses the `@vicinae/api` for integration with the Vicinae environment. The UI components are built with React.

## Building and Running

### Prerequisites

- Node.js and npm
- Vicinae CLI (`vici`)

### Installation

To install the dependencies, run:

```bash
npm install
```

### Development

To run the extension in development mode, use the following command. This will watch for file changes and automatically rebuild the extension.

```bash
npm run dev
```

### Building

To create a production build of the extension, run:

```bash
npm run build
```

### Linting

To check the code for linting errors, run:

```bash
npm run lint
```

### Formatting

To automatically format the code, run:

```bash
npm run format
```

## Development Conventions

- **Language**: TypeScript
- **Styling**: The project uses `@biomejs/biome` for code formatting and linting.
- **Dependencies**: Project dependencies are managed with npm.
- **UI**: The UI is built using React and the components provided by the `@vicinae/api`.
- **Entry Points**: The extension has three main commands:
    - `open`: Opens the selected Finder items in Zed.
    - `open-new-window`: Opens the selected Finder items in a new Zed window.
    - `search`: Provides a searchable list of recent Zed projects.
