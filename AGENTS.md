# Agent Guidelines for Zed Extension

## Commands

- **Build**: `vici build`
- **Dev**: `vici develop`
- **Format**: `biome format --write src`
- **Lint**: `vici lint`

## Code Style

- **Language**: TypeScript with strict mode enabled
- **JSX**: React with react-jsx transform
- **Imports**: Named imports preferred, relative paths with `../`
- **Naming**: PascalCase for interfaces/types, camelCase for variables/functions
- **Async**: Use async/await, avoid promises directly
- **Error handling**: Try/catch blocks, use `showFailureToast` for user errors
- **Formatting**: Biome (no semicolons, consistent spacing)
- **Components**: Functional components with hooks, destructure props
- **Types**: Define interfaces for component props and complex objects</content>
