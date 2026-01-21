# Racing Equipment Configuration System

A pixel-art styled racing driver equipment configuration system built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Build Tool**: Vite 7.x (with Rolldown)
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React useState/useContext

## Project Structure

```
.
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── services/        # Business logic and data services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles with Tailwind directives
├── .kiro/
│   └── specs/          # Project specifications
│       └── racing-equipment-config/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:5173/

### Build

```bash
# Build for production
npm run build
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

## Features (MVP-P0)

- ✅ Project structure with Vite + React + TypeScript
- ✅ Tailwind CSS configured with pixel-art base styles
- ✅ Directory structure: components, services, types, utils
- 🚧 Equipment slot management (10 slots)
- 🚧 Equipment library grid
- 🚧 Equipment selection and equipping
- 🚧 localStorage persistence
- 🚧 Status bar with equipment counts

## Pixel-Art Styling

The project uses custom Tailwind utilities for pixel-art aesthetics:

- `.pixel-button` - Pixel-art styled buttons
- `.pixel-card` - Pixel-art styled cards
- `.pixel-border` - Pixel-art border with shadow

All images are rendered with `image-rendering: pixelated` for crisp pixel art.

## License

MIT
