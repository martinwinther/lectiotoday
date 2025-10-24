# LectioToday

A minimalist daily reflection application that presents one carefully curated philosophical or religious passage each day, accompanied by a thoughtful discussion space. Built as a showcase of modern web development practices, the application demonstrates expertise in full-stack TypeScript development, serverless architecture, and thoughtful user experience design.

## What It Does

LectioToday serves as a digital sanctuary for daily contemplation, featuring:

- **Daily Wisdom**: One carefully selected passage from diverse philosophical and religious traditions (Marcus Aurelius, Epictetus, Bhagavad Gītā, Bible, Qur'an, Confucian texts, and modern philosophers)
- **Persistent Conversations**: Discussion threads that remain attached to specific passages through stable content-based IDs
- **Thoughtful Community**: A moderated discussion space designed to encourage meaningful reflection rather than quick reactions

## Technical Architecture

### Core Technologies

- **Next.js 15** with App Router for modern React development
- **TypeScript** with strict typing for robust code quality
- **Tailwind CSS v4** for responsive, utility-first styling
- **Cloudflare Pages** for global edge deployment
- **Cloudflare D1** (SQLite) for serverless database operations
- **Cloudflare Turnstile** for bot protection without cookies

### Key Technical Decisions

**Serverless-First Architecture**: The application leverages Cloudflare's edge network for global performance while maintaining zero infrastructure costs. All API routes are implemented as Next.js App Router handlers that deploy as Cloudflare Workers.

**Content Management**: Philosophical passages are managed through a CSV-based workflow with automated JSON compilation, ensuring version control and easy content updates without database dependencies.

**Security & Privacy**:

- IP addresses are hashed with salt for rate limiting without storing personal data
- Turnstile provides bot protection without invasive tracking
- Rate limiting prevents spam while maintaining accessibility
- Duplicate detection preserves discussion quality

**Performance Optimizations**:

- Static generation for quote selection using deterministic hashing
- Edge caching for optimal global performance
- Minimal JavaScript bundle with modern React patterns
- Progressive enhancement for core functionality

## Implementation Highlights

### Quote Selection Algorithm

The daily quote rotation uses a deterministic hash function based on the current date, ensuring consistent daily experience while appearing random. This approach eliminates the need for server-side state while maintaining predictable behavior.

### Discussion System

Built with modern React patterns including:

- Custom hooks for state management
- Optimistic UI updates
- Error boundary patterns
- Accessibility-first design
- Real-time validation and feedback

### Database Design

SQLite schema optimized for discussion features:

- Stable quote IDs derived from content hashing
- Efficient indexing for comment retrieval
- Privacy-preserving IP hashing for rate limiting
- Extensible design for future moderation features

### Deployment Pipeline

Automated deployment using OpenNext for Cloudflare compatibility:

- Advanced mode configuration for optimal performance
- Asset optimization and bundling
- Environment-specific configurations
- Zero-downtime deployments

## Code Quality & Development Practices

### TypeScript Implementation

- **Strict TypeScript** configuration with comprehensive type definitions
- **Zod validation** for runtime type safety in API routes
- **Custom type definitions** for domain models (quotes, comments)
- **Error handling** with proper type guards and user-friendly messages

### React Development Patterns

- **Server Components** for optimal performance and SEO
- **Client Components** only where interactivity is required
- **Custom hooks** for reusable stateful logic
- **Optimistic updates** for responsive user experience
- **Accessibility-first** design with proper ARIA labels and keyboard navigation

### API Design

RESTful API endpoints built with Next.js App Router:

- `GET /api/comments` - Retrieve comments for a specific quote
- `POST /api/comments` - Create new comments with validation
- `POST /api/report` - Report inappropriate content
- Comprehensive input validation using Zod schemas
- Rate limiting and spam prevention
- Privacy-preserving data handling

### Database Architecture

SQLite schema designed for scalability and privacy:

- **Comments table** with efficient indexing for quote-based queries
- **Votes table** prepared for future moderation features
- **Hash-based deduplication** to prevent spam
- **Privacy-first design** with IP hashing instead of storage

### Build & Deployment

- **OpenNext** configuration for Cloudflare Workers compatibility
- **Automated content pipeline** from CSV to optimized JSON
- **Edge-optimized** asset delivery
- **Environment-specific** configurations for development and production

## Skills Demonstrated

This project showcases proficiency in:

- **Modern React Development**: Server/Client Components, hooks, TypeScript
- **Serverless Architecture**: Cloudflare Workers, edge computing, zero-config deployment
- **Database Design**: SQLite optimization, indexing strategies, privacy considerations
- **Security Implementation**: Bot protection, rate limiting, input validation
- **Performance Optimization**: Edge caching, static generation, minimal bundle sizes
- **Developer Experience**: Automated workflows, type safety, error handling
- **User Experience Design**: Accessibility, responsive design, progressive enhancement

## Technical Challenges Solved

1. **Deterministic Quote Selection**: Implemented hash-based rotation without server state
2. **Privacy-Preserving Rate Limiting**: IP hashing for abuse prevention without data collection
3. **Edge-Compatible Architecture**: Full-stack application optimized for Cloudflare Workers
4. **Content Version Control**: CSV-based workflow with automated JSON compilation
5. **Real-time Validation**: Client-side feedback with server-side security validation

## License

MIT
