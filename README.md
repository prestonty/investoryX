# InvestoryX Frontend

A modern, responsive financial analytics platform built with Next.js 15 and
TypeScript, designed to provide comprehensive stock market insights and
portfolio management capabilities.

Here's the link to [InvestoryX Backend](https://github.com/prestonty/investoryX-backend)

## Architecture Overview

This frontend application follows a **Backend for Frontend (BFF)** architecture
pattern, where the frontend communicates exclusively through centralized API
abstraction layers rather than making direct HTTP calls from individual
components. This approach ensures clean separation of concerns, consistent error
handling, and maintainable code structure.

### BFF Implementation

The application implements BFF through two core modules:

-   **`/src/lib/api.ts`** - Centralized API client for all backend communication
-   **`/src/lib/auth.ts`** - Authentication utilities and token management

All frontend pages and components consume these modules instead of implementing
their own HTTP logic, resulting in cleaner, more maintainable code and
consistent error handling across the application.

## Technology Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript 5.9
-   **Styling**: Tailwind CSS with custom animations
-   **State Management**: React hooks with custom state management
-   **Charts**: Plotly.js for financial data visualization
-   **Icons**: `react-icons` (`fa`, `fa6`, and `go` icon sets)
-   **Animations**: Framer Motion and GSAP for smooth user interactions
-   **Authentication**: JWT-based authentication with secure cookie management

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard with market overview
│   ├── latest-news/      # Financial news aggregation
│   ├── login/            # User authentication
│   ├── sign-up/          # User registration
│   ├── stock/            # Individual stock analysis pages
│   │   └── [ticker]/     # Dynamic stock routes
│   └── watchlist/        # User portfolio management
├── components/            # Reusable UI components
│   ├── animations/       # Animation wrappers and effects
│   └── tools/            # Specialized components (charts, etc.)
├── lib/                  # Core utilities and API layer
│   ├── api.ts           # BFF API client
│   ├── auth.ts          # Authentication utilities
│   └── utils/           # Helper functions
├── types/                # TypeScript type definitions
└── styles/               # Global CSS and animations
```

## Core Pages

### Dashboard (`/dashboard`)

The main application hub displaying market overview, user portfolio summary, and
real-time financial data. Integrates with backend APIs to fetch market indices,
news, and user-specific information.

### Latest News (`/latest-news`)

Financial news aggregation page that pulls market-relevant articles from backend
news services, providing users with current market insights and analysis.

### Authentication (`/login`, `/sign-up`)

Secure user authentication system with JWT token management, email verification,
and secure cookie handling. Implements proper form validation and error
handling.

### Stock Analysis (`/stock/[ticker]`)

Dynamic stock detail pages that provide comprehensive analysis including price
charts, company information, and technical indicators. Each stock page fetches
data through the centralized API layer.

### Watchlist (`/watchlist`)

Portfolio management interface allowing users to track selected stocks, view
performance metrics, and manage their investment watchlist through authenticated
API calls.

## API Integration

The frontend communicates with the backend through a structured API layer that
abstracts all HTTP communication:

### Stock Data Services

-   Real-time stock price fetching
-   Historical data for charting
-   Company overview and financial metrics
-   Market index and ETF data

### User Management

-   User registration and authentication
-   Profile management
-   Watchlist operations
-   Email verification system on account registration

### Data Fetching Patterns

All data fetching follows consistent patterns:

-   Server-side rendering for initial page loads
-   Client-side updates for real-time data
-   Proper error handling and loading states
-   Caching strategies for performance optimization

## Performance Optimizations

### Image Optimization

The application uses WebP image format for significantly reduced file sizes
while maintaining visual quality. This optimization reduces bandwidth usage and
improves page load times, particularly important for mobile users.

### Code Splitting

Next.js automatic code splitting ensures only necessary JavaScript is loaded for
each route, improving initial page load performance.

### Server-Side Rendering

Critical pages implement server-side rendering for improved SEO and faster
initial content display.

## Development

### Prerequisites

-   Node.js 18+
-   npm or yarn package manager

### Installation

```bash
npm i
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Configuration

Look at .env.example for configurations

## Backend Integration

This frontend application is designed to work with the
[InvestoryX Backend](https://github.com/prestonty/investoryX-backend) service,
which provides:

-   RESTful API endpoints for all financial data
-   Real-time market data integration
-   User authentication and authorization
-   Database management for user preferences and watchlists
-   Email services for user verification

The BFF pattern ensures that any changes to backend API contracts only require
updates to the centralized API layer, maintaining clean separation between
frontend presentation logic and backend data services.

## Contributing

When contributing to this frontend application:

1. Follow the established BFF pattern for all API calls
2. Maintain consistent TypeScript typing
3. Implement proper error handling and loading states
4. Follow the existing component structure and naming conventions
5. Ensure responsive design for all new components

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.

This project is part of the InvestoryX financial analytics platform.
