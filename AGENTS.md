# Agent Guidelines for Zed Extension

## Commands

- **Build**: `vici build`
- **Dev**: `vici develop`
- **Format**: `biome format --write src`
- **Lint**: `vici lint`
- **Test**: `jest` (run all tests)

## Project Structure

```
src/
├── components/           # React components
│   ├── error-boundary.tsx
│   ├── entry-item.tsx
│   └── with-zed.tsx
├── hooks/               # Custom React hooks
│   ├── use-pinned-entries.ts
│   └── use-recent-workspaces.ts
├── lib/                 # Core business logic
│   ├── index.ts         # Barrel exports
│   ├── config.ts        # Configuration constants
│   ├── logger.ts        # Structured logging
│   ├── utils.ts         # Utility functions
│   ├── db.ts            # Database operations
│   ├── workspaces.ts    # Workspace type definitions
│   ├── entry.ts         # Entry transformations
│   ├── git.ts           # Git operations
│   ├── zed.ts           # Zed-specific utilities
│   └── repositories/    # Data access layer
│       └── workspace-repository.ts
├── open.ts              # Clipboard open command
├── open-new-window.ts   # New window command
└── search.tsx           # Main search interface
```

## Code Style & Best Practices

### **Language & Tooling**
- **TypeScript**: Strict mode enabled, no implicit any
- **JSX**: React with react-jsx transform (no React imports needed)
- **Formatting**: Biome (no semicolons, consistent spacing)
- **Linting**: Vicinae linter for extension-specific rules

### **Imports & Organization**
- **Barrel exports**: Use `src/lib/index.ts` for clean imports
- **Relative paths**: Use `../` for internal imports
- **Named imports**: Preferred over default imports
- **Group imports**: External libs, then internal modules

### **Naming Conventions**
- **PascalCase**: Interfaces, types, component names
- **camelCase**: Variables, functions, properties
- **SCREAMING_SNAKE_CASE**: Constants and enums
- **kebab-case**: File names

### **Architecture Patterns**
- **Repository Pattern**: Data access through `WorkspaceRepository`
- **Error Boundaries**: React error boundaries for crash prevention
- **Structured Logging**: Consistent logging with context and metadata
- **Configuration Management**: Centralized config in `config.ts`

### **Error Handling**
- **Try/catch blocks**: For all async operations
- **Structured logging**: Use `logger` for debugging and monitoring
- **User-friendly messages**: `showFailureToast` for user-facing errors
- **Error boundaries**: Prevent component crashes

### **React Best Practices**
- **Functional components**: With hooks, no class components
- **Props destructuring**: Always destructure component props
- **Custom hooks**: Extract reusable logic into custom hooks
- **Error boundaries**: Wrap components that might fail

### **Database & Data Handling**
- **Repository pattern**: Clean separation of data access
- **Type safety**: Strongly typed database operations
- **Validation**: Input validation and error handling
- **Caching**: Use LocalStorage for persistent state

### **Async Programming**
- **Async/await**: Preferred over raw promises
- **Error propagation**: Proper error handling in async functions
- **Loading states**: Show loading indicators during async operations
- **Cancellation**: Handle component unmounting in async operations

### **Testing Guidelines**
- **Unit tests**: For utilities, hooks, and repositories
- **Integration tests**: For component interactions
- **Mock external APIs**: Use Jest mocks for Vicinae API calls
- **Test error scenarios**: Cover error handling paths

### **Performance Considerations**
- **Memoization**: Use React.memo for expensive components
- **Efficient re-renders**: Proper dependency arrays in hooks
- **Database queries**: Minimize database calls, use caching
- **Bundle size**: Keep dependencies minimal

### **Security & Reliability**
- **Input validation**: Validate all user inputs and API responses
- **Error boundaries**: Prevent crashes from propagating
- **Logging**: Comprehensive logging for debugging
- **Type safety**: Leverage TypeScript for runtime safety</content>
