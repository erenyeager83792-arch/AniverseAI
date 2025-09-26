# AniVerse AI - Manga & Anime Chatbot

## Overview

AniVerse AI is a full-stack Progressive Web App (PWA) featuring an intelligent chatbot specialized in anime and manga discussions. The application provides real-time chat functionality powered by the Perplexity API, designed with an anime-themed dark UI and glassmorphism effects. The system is built as a modern web application that can be installed on mobile devices like a native app.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom anime-themed design system and Shadcn UI components
- **State Management**: TanStack Query for server state management and data fetching
- **UI Components**: Comprehensive Radix UI component library through Shadcn for accessible, customizable components
- **PWA Support**: Service worker implementation for offline capabilities and app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript throughout for consistency and type safety
- **Storage**: In-memory storage system using Map data structures for chat sessions and messages
- **API Design**: RESTful endpoints for chat session management and message handling

### Data Storage Solutions
- **Primary Storage**: In-memory storage using custom MemStorage class implementing IStorage interface
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions for potential database migration
- **Session Management**: UUID-based session and message identification
- **Data Models**: Structured chat sessions and messages with timestamps and role-based messaging

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Handling**: Simple session-based chat management without user authentication

### UI/UX Design Patterns
- **Theme**: Dark mode with anime-inspired color palette (orange/red gradients)
- **Typography**: Multiple font families including Inter, Orbitron, and JetBrains Mono
- **Responsive Design**: Mobile-first approach with comprehensive breakpoint handling
- **Animations**: CSS animations for message appearance and loading states
- **Accessibility**: Radix UI components provide built-in accessibility features

### Development Tooling
- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESBuild for production bundling
- **Development Server**: Hot module replacement and error overlay for development experience

## External Dependencies

### Core AI Integration
- **Perplexity API**: Primary AI service for generating anime/manga-specialized responses
- **API Configuration**: Environment-based API key management with fallback support

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL schema management
- **Neon Database**: Serverless PostgreSQL database provider integration
- **Migration System**: Database schema versioning and migration support

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system extensions
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Web fonts for typography (Inter, Orbitron, JetBrains Mono)

### Development and Build Tools
- **Vite**: Modern build tool with plugin ecosystem for React and TypeScript
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Replit Integration**: Development environment plugins for Replit-specific features

### Data Fetching and State
- **TanStack Query**: Server state management with caching, synchronization, and background updates
- **React Hook Form**: Form handling with validation support
- **Zod**: Runtime type validation and schema parsing

### PWA and Service Worker
- **Custom Service Worker**: Caching strategy for offline functionality
- **Web App Manifest**: PWA configuration for installation and native app experience
- **Workbox**: Service worker libraries for PWA features (potential future integration)

### Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **CLSX**: Conditional className utility for dynamic styling