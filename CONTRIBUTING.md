# Contributing to Delivery Tracking System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/delivery-tracking-system.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start databases
npm run docker:up

# Run migrations
npm run prisma:migrate
npm run prisma:generate

# Start development server
npm run dev
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style
- Use Prettier for formatting: `npm run format`
- Use ESLint for linting: `npm run lint`

## Commit Messages

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add driver earnings report
fix: resolve payment callback race condition
docs: update API documentation
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the API documentation if you change endpoints
3. Ensure all tests pass
4. Request review from maintainers
5. Wait for approval before merging

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Adding New Features

When adding new features:

1. Create a feature branch
2. Add necessary database migrations
3. Implement the feature with proper error handling
4. Add validation schemas
5. Update API documentation
6. Add tests
7. Update README if needed

## Reporting Bugs

When reporting bugs, include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

## Security Issues

Please report security issues privately to security@example.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🚀
