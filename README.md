# Fluro Sheet Music Viewer

A React/Next.js application that provides a sheet music viewer for the Fluro church management system. This application allows users to authenticate with their Fluro accounts and view sheet music for songs, service plans, and custom setlists.

## 🚀 Migration Complete: Vue.js → React

This project has been successfully migrated from **Nuxt 3 + Vue.js** to **Next.js + React** with significant improvements:

### Key Improvements
- **✅ Lightweight PDF Library**: Replaced `@tato30/vue-pdf` with `react-pdf` for better performance
- **✅ Modern React Architecture**: Using React hooks, Context API, and TypeScript
- **✅ Next.js App Router**: File-based routing with better performance
- **✅ Better State Management**: React Context instead of Pinia stores
- **✅ Improved TypeScript**: Proper exports instead of global declarations

## Technology Stack

- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Rendering**: react-pdf (lightweight alternative)
- **State Management**: React Context API
- **Authentication**: Fluro API integration
- **Build**: Next.js with static export capabilities

## Features

- 🔐 **Authentication** - Token-based auth with Fluro API
- 📄 **PDF Sheet Music Viewer** - Lightweight PDF rendering with navigation
- 📅 **Service Plans** - View and navigate service plans
- 🎵 **Songs Library** - Browse individual songs with sheet music
- 📝 **Custom Setlists** - Create and manage custom song collections
- 📱 **Responsive Design** - Works on mobile and desktop
- ⌨️ **Keyboard Navigation** - Arrow keys for page/song navigation
- 💾 **Local Storage** - Persistent user preferences and caching

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Development

The application runs on `http://localhost:3000` in development mode.

### Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Homepage
│   ├── login/           # Authentication
│   ├── plans/           # Service plans
│   ├── songs/           # Songs library
│   └── custom/          # Custom setlists
├── components/          # Reusable React components
│   ├── ui/             # Basic UI components
│   ├── Navigation.tsx  # Main navigation
│   ├── PdfRender.tsx   # PDF viewer component
│   └── PdfWrapper.tsx  # PDF navigation wrapper
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── DataContext.tsx # Data management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

### Key Components

- **PdfRender**: Lightweight PDF viewer using react-pdf
- **PdfWrapper**: Navigation controls and multi-song handling
- **AuthContext**: Authentication state management
- **DataContext**: Songs, sheets, and services data management

### API Integration

The app integrates with the Fluro API for:
- User authentication (`/token/login`, `/token/refresh`)
- Content retrieval (`/content/{type}`)
- File access (`/get/{id}`)

## Environment

No environment variables are required for basic functionality. The app connects directly to the Fluro API at `https://api.fluro.io`.

## Authentication

Users authenticate with their existing Fluro account credentials. The app supports:
- Token-based authentication
- Automatic token refresh
- Session persistence via local storage

## Migration Notes

This React version maintains full feature parity with the original Vue.js version while providing:
- Better performance with lighter PDF library
- Improved code maintainability with modern React patterns
- Enhanced TypeScript support
- Cleaner component architecture

## Contributing

1. Follow the existing code style (ESLint configured)
2. Use TypeScript for all components
3. Maintain responsive design principles
4. Test authentication flows thoroughly

## License

Built with ❤️ by [Bevan Kay](https://bevankay.me)
