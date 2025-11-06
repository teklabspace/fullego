# 🏆 Fullego - Luxury Wealth & Lifestyle Management Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare-pages)

**A comprehensive wealth management platform for high-net-worth individuals and
entrepreneurs**

[Features](#-features) • [Getting Started](#-getting-started) •
[Deployment](#-deployment) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

Fullego is a luxury wealth and lifestyle management platform designed for
high-net-worth individuals and entrepreneurs. It combines investment tracking,
asset management, estate planning, and exclusive marketplace access into one
AI-powered dashboard, making it easy to grow, manage, and protect generational
wealth.

### Key Highlights

- 💼 **Comprehensive Asset Management** - Track and manage all your assets in
  one place
- 📊 **Advanced Portfolio Analytics** - Real-time insights and performance
  tracking
- 🏪 **Exclusive Marketplace** - Access to premium investment opportunities
- 📄 **Document Management** - Secure storage and organization of financial
  documents
- 🎯 **Wealth Structure Planning** - Entity structure and compliance management
- 📈 **Real-time Reporting** - Detailed reports and analytics for informed
  decisions

---

## ✨ Features

### 🎯 Core Features

- **Dashboard Overview**

  - Real-time net worth tracking
  - Asset allocation visualization
  - Performance analytics with interactive charts
  - Available liquidity monitoring

- **Asset Management**

  - Comprehensive asset tracking (Real Estate, Stocks, Crypto, etc.)
  - Asset detail pages with valuation history
  - Document association and management
  - Appraisal and sale request workflows

- **Portfolio Management**

  - Portfolio overview with performance metrics
  - Asset allocation breakdown (Pie charts, area charts)
  - Top holdings analysis
  - Cash flow forecasting
  - Trade engine for active trading

- **Marketplace**

  - Browse exclusive investment opportunities
  - Filter by asset type, risk level, and returns
  - Detailed investment opportunity pages
  - Investment tracking

- **Reports & Documents**

  - Generate comprehensive financial reports
  - Document upload and management
  - Secure document sharing
  - Report scheduling and automation

- **Wealth Structure**
  - Entity structure management
  - Compliance tracking
  - Legal document organization

### 🎨 UI/UX Features

- **Modern Design System**

  - Dark/light theme support
  - Responsive design (mobile, tablet, desktop)
  - Smooth animations with Framer Motion
  - Glass morphism effects
  - Interactive charts with Recharts

- **User Experience**
  - Intuitive navigation with sidebar menu
  - Real-time notifications
  - Profile management
  - Search functionality
  - Modal workflows for actions

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.1](https://nextjs.org/) with App Router
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion 12.23.24
- **Charts**: Recharts 2.13.3
- **Animations**: GSAP 3.13.0

### Build & Deployment

- **Static Export**: Configured for Cloudflare Pages
- **Build Tool**: Next.js with Turbopack
- **Deployment**: Cloudflare Pages

### Development Tools

- **Linting**: ESLint with Next.js config
- **Package Manager**: npm
- **Node Version**: >=20.9.0

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.9.0
- npm >= 10.0.0

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/fullego.git
   cd fullego
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser** Navigate to
   [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Deployment
npm run pages:build  # Build for Cloudflare Pages
npm run pages:deploy # Deploy to Cloudflare Pages
npm run cf:deploy    # Build and deploy in one command

# Code Quality
npm run lint         # Run ESLint
```

---

## 📁 Project Structure

```
fullego/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── assets/        # Asset management
│   │   │   ├── portfolio/     # Portfolio management
│   │   │   ├── marketplace/   # Investment marketplace
│   │   │   ├── reports/       # Reports & analytics
│   │   │   └── documents/     # Document management
│   │   ├── about/             # About page
│   │   └── layout.js          # Root layout
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   ├── ui/                # UI components
│   │   └── sections/          # Page sections
│   ├── context/               # React context providers
│   └── app/globals.css      # Global styles
├── public/                     # Static assets
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── jsconfig.json              # JavaScript path aliases
└── package.json               # Dependencies
```

---

## 🌐 Deployment

### Cloudflare Pages Deployment

This project is configured for static export and deployment on Cloudflare Pages.

#### Build Settings

- **Framework preset**: `Next.js (Static HTML Export)`
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`

#### Deployment Methods

**Option 1: Via Cloudflare Dashboard (Recommended)**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Connect your Git repository
4. Configure build settings as above
5. Deploy automatically on every push

**Option 2: Via Wrangler CLI**

```bash
# Login to Cloudflare
npx wrangler login

# Build and deploy
npm run cf:deploy
```

For detailed deployment instructions, see
[CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

---

## 🎨 Features Showcase

### Dashboard

- Real-time net worth tracking
- Interactive performance charts
- Asset allocation visualization
- Quick access to all features

### Asset Management

- Add, view, and manage assets
- Detailed asset pages with images
- Valuation history tracking
- Document association
- Appraisal and sale workflows

### Portfolio Analytics

- Performance metrics
- Asset allocation breakdown
- Top holdings analysis
- Cash flow forecasting

### Marketplace

- Browse investment opportunities
- Filter by multiple criteria
- Detailed opportunity pages
- Investment tracking

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development (if needed):

```env
# Add your environment variables here
```

### Path Aliases

The project uses path aliases configured in `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This allows imports like:

```javascript
import Component from '@/components/Component';
```

---

## 📝 Development Guidelines

### Code Style

- Use ESLint configuration provided
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

### Component Structure

- Keep components modular and reusable
- Use TypeScript-style prop validation
- Implement proper loading and error states

### Styling

- Use Tailwind CSS utility classes
- Follow the design system
- Ensure responsive design
- Support dark/light themes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 📞 Support

For support, email support@fullego.com or open an issue in the repository.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Recharts](https://recharts.org/) - Chart library
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting platform

---

<div align="center">

**Built with ❤️ using Next.js and Tailwind CSS**

⭐ Star this repo if you find it helpful!

</div>
