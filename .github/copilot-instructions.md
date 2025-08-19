# Copilot Instructions for Fluro Sheet Music Viewer

## Project Overview

This is a **Nuxt 3** application that provides a sheet music viewer for the Fluro church management system. The application allows users to authenticate with their Fluro accounts and view sheet music for songs, service plans, and custom setlists.

### Key Technologies
- **Nuxt 3** with TypeScript and Vue 3 Composition API
- **Tailwind CSS** for styling with **PrimeVue** components
- **Pinia** for state management
- **VueUse** for Vue composables
- **PDF.js** for sheet music rendering
- **Fluro API** integration for church management data

## Architecture & Patterns

### File Structure
- `pages/` - File-based routing with Vue components
- `components/` - Reusable Vue components with TypeScript
- `stores/` - Pinia stores for global state management
- `utils/` - Utility functions and API helpers
- `middleware/` - Route middleware (primarily authentication)
- `types/` - Global TypeScript interface definitions

### Authentication Flow
- Uses token-based authentication with the Fluro API
- Tokens stored in localStorage via VueUse's `useStorage`
- Global auth middleware protects routes
- Automatic token refresh on API failures
- User session validation on route changes

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define interfaces in `types/index.ts` within global declaration
- Prefer interface over type aliases for object shapes
- Use proper typing for API responses and state

### Vue Components
- Use Composition API with `<script setup lang="ts">`
- Prefer `defineProps<>()` with TypeScript interfaces
- Use `ref()` and `reactive()` appropriately
- Implement proper TypeScript generics for composables

### Styling
- Use Tailwind CSS utility classes primarily
- PrimeVue components for complex UI elements
- Custom theme configuration in `nuxt.config.ts`
- Dark mode support via CSS classes and VueUse storage

### State Management
- Pinia stores follow a specific pattern:
  - Reactive state object
  - Async functions for API calls
  - VueUse storage for persistence
  - Cache management with expiry timestamps

## API Integration

### Fluro API Patterns
- Base URL: `https://api.fluro.io`
- All requests require Bearer token authentication
- Use `useFluroData()` for reactive data fetching
- Use `useAsyncFluroData()` for one-time async calls
- Handle token refresh automatically on 401 responses

### Common API Endpoints
- `/token/login` - User authentication
- `/token/refresh` - Token refresh
- `/session` - User session validation
- `/content/{type}` - Content retrieval (songs, plans, etc.)
- `/content/multiple` - Batch content retrieval

## Component Guidelines

### Page Components
- Located in `pages/` directory
- Handle route parameters via `useRoute()`
- Set page metadata with `useSeoMeta()`
- Include loading states and error handling

### Reusable Components
- Use descriptive, PascalCase names
- Accept props via TypeScript interfaces
- Emit events with proper typing
- Include proper accessibility attributes

### Typography Component
- Use the custom `Typography` component for consistent text styling
- Supports `variant` (h1-h6, p) and `size` (heading-xl to text) props
- Provides consistent spacing and font weights

## State Management Patterns

### Store Structure
```typescript
export const useExampleStore = defineStore("exampleStore", () => {
  // Reactive state
  const state = reactive({
    items: [] as Item[]
  });
  
  // Persisted storage
  const persistedItems: Ref<Item[]> = useStorage("persistedItems", state.items);
  const persistedExpiry: Ref<number> = useStorage("persistedItemsExpiry", 0);
  
  // Actions
  async function getItems() {
    // Check cache first
    if (persistedExpiry.value > Date.now() && state.items.length > 0) {
      state.items = persistedItems.value;
      return;
    }
    
    // Fetch from API
    const { data } = await useAsyncFluroData("item");
    state.items = data.value;
  }
  
  // Cache management
  const clearCache = () => {
    persistedItems.value = [];
    persistedExpiry.value = 0;
  };
  
  return { state, getItems, clearCache };
});
```

## Development Guidelines

### Error Handling
- Use try-catch blocks for async operations
- Log errors to console with descriptive messages
- Display user-friendly error messages via Toast
- Implement graceful fallbacks for API failures

### Performance
- Use lazy loading for large components
- Implement proper caching strategies
- Avoid unnecessary re-renders with computed properties
- Use `useAsyncData` for SSR-compatible data fetching

### Security
- Never commit API credentials or tokens
- Validate user input on both client and server
- Use proper CORS configuration
- Implement proper authentication checks

## Testing Approach

Currently no automated tests are configured. When adding tests, consider:
- Unit tests for utility functions and stores
- Component testing for Vue components
- Integration tests for API interactions
- E2E tests for critical user flows

## Build & Deployment

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint code checking
- `npm run preview` - Preview production build

### Configuration
- ESLint configured with strict rules (semicolons, double quotes)
- TypeScript strict mode enabled
- SSR disabled (`ssr: false`) for client-side rendering
- Tailwind CSS with custom PrimeVue theme integration

## API Data Types

### Core Interfaces
- `User` - Authentication and user session data
- `Song` - Individual song with sheet music references
- `Plan` - Service plans with schedules and songs
- `Sheet` - Sheet music documents with PDF data
- `Service` - Church services with associated plans

### Common Patterns
- All entities have `_id` string identifier
- Dates are stored as `Date` objects
- Related data uses reference IDs for lazy loading
- Pagination support for large datasets

## Best Practices

1. **Always type your data** - Use proper TypeScript interfaces
2. **Cache wisely** - Implement appropriate cache strategies with expiry
3. **Handle loading states** - Show spinners and loading messages
4. **Validate auth** - Check authentication status before API calls
5. **Use composables** - Leverage VueUse and custom composables
6. **Follow conventions** - Maintain consistent naming and structure
7. **Error boundaries** - Implement proper error handling and recovery
8. **Accessibility** - Use semantic HTML and ARIA attributes

## Common Gotchas

- Remember to handle token refresh on API failures
- VueUse storage is reactive - watch for changes appropriately
- PrimeVue components may need specific CSS imports
- PDF rendering requires proper error handling for missing files
- Dark mode changes require manual DOM class management

This application serves church communities by providing easy access to sheet music during worship services. Keep the user experience simple and reliable, especially for mobile usage during live services.