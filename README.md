# SchemaFlow

**Database Governance Platform - GitHub PRs for Databases**

SchemaFlow is a modern web application that brings GitHub-style Pull Request workflows to database schema management. Propose, review, approve, and execute schema changes with complete visibility and control.

## Features

- 🛡️ **Governance Built-in** - Review schema changes like code PRs with approval workflows
- ⚡ **Risk Simulation** - Preview impact before execution with estimated times and dependencies
- 👥 **Role-Based Access** - Developers propose, admins approve with complete audit trail
- 💻 **Developer Mode** - Toggle between friendly names and raw SQL types
- 🕐 **Version Control** - Track every change and rollback to any previous state
- ✨ **Visual Schema Editor** - Interactive canvas for designing database schemas

## Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **UI:** React 19, Tailwind CSS, Framer Motion
- **Components:** Radix UI, Heroicons
- **State Management:** Zustand
- **Visualization:** XYFlow (React Flow)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ayuussshhh/newBase-UI.git
cd newBase-UI
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will start on [http://localhost:3001](http://localhost:3001).

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── lib/          # Utility functions
└── store/        # Zustand state management
```

## Development

The application uses hot-reload, so changes to files in `src/` will automatically update in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private.
