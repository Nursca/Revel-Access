# Revel - Onchain Experiences Platform

Revel is a flagship token-gated content platform built on Base, enabling creators to share exclusive content with their community using Zora Creator Coins.

## Features

- **Token-Gated Content**: Secure content access using ERC-20 token verification
- **Creator Dashboard**: Manage drops, track analytics, and engage with fans
- **Fan Discovery**: Browse and unlock exclusive content from favorite creators
- **On-Chain Verification**: Real-time token balance checking on Base network
- **Beautiful UI**: "Living Crystal" design with glassmorphism and aurora effects
- **Mobile-First**: Optimized for all devices with responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS v4
- **Web3**: Wagmi, Viem, OnchainKit
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Base (Ethereum L2)
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account (for database)
- Coinbase Developer account (for OnchainKit API key)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd revel-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your `.env.local` file with the required values:
   - Supabase URL and anon key
   - OnchainKit API key
   - Other configuration options

5. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the scripts in order:
     1. `scripts/01_create_tables.sql`
     2. `scripts/02_create_functions.sql`
     3. `scripts/03_row_level_security.sql`

6. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `.env.example` for all required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Coinbase OnchainKit API key (get from https://portal.cdp.coinbase.com/)
  - **Note**: This is a PUBLIC client-side API key (similar to Google Maps API keys)
  - It's designed to be exposed in the browser and used for rate limiting/analytics
  - Security warnings about this key can be safely ignored - this is the official recommended usage
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: (Optional) WalletConnect project ID
- `NEXT_PUBLIC_ADMIN_ADDRESSES`: Comma-separated admin wallet addresses

### Getting Your OnchainKit API Key

1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Sign in or create an account
3. Create a new project
4. Copy your API key
5. Add it to your `.env.local` file or Vercel environment variables

**Important**: OnchainKit API keys are public keys meant for client-side use. They are NOT sensitive credentials and are safe to expose in your frontend code.

## Project Structure

\`\`\`
revel-platform/
├── app/                      # Next.js app router pages
│   ├── admin/               # Admin panel
│   ├── creators/            # Creator discovery & profiles
│   ├── dashboard/           # Creator dashboard
│   ├── drops/               # Drop detail pages
│   ├── explore/             # Browse drops
│   └── onboarding/          # User onboarding
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── aurora-background.tsx
│   ├── connect-wallet.tsx
│   ├── genesis-orb.tsx
│   └── navigation.tsx
├── lib/                     # Utilities and helpers
│   ├── db/                  # Database operations
│   ├── supabase/            # Supabase clients
│   ├── auth.ts              # Authentication utilities
│   ├── token-verification.ts # Token gating logic
│   ├── types.ts             # TypeScript types
│   └── wagmi-config.ts      # Web3 configuration
├── hooks/                   # Custom React hooks
├── scripts/                 # Database migration scripts
└── public/                  # Static assets
\`\`\`

## Key Features Explained

### Token Gating

Revel uses on-chain verification to check if users hold the required amount of Creator Coins (ERC-20 tokens) before granting access to content. The verification happens in real-time using wagmi's `readContract` function.

### Database Schema

- **users**: Creator and fan profiles
- **drops**: Token-gated content drops
- **unlocks**: Tracks which users have unlocked which drops
- **communities**: (Future) Creator communities

### Design System

The "Living Crystal" design features:
- Deep navy background (#0A0F1A)
- Electric blue primary (#00A8FF)
- Magenta accent (#E6007A)
- Glassmorphism effects with backdrop blur
- Aurora borealis animated background
- Smooth transitions and physics-based animations

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Database Setup

Make sure to run all SQL scripts in your Supabase project before deploying.

## Development

### Running Locally

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
\`\`\`

### Testing Token Gating

For development, the app uses Base Sepolia testnet. You can:
1. Get testnet ETH from a faucet
2. Deploy a test ERC-20 token or use an existing one
3. Add the token address when creating your creator profile

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the team at support@revel.app

## Roadmap

- [ ] IPFS integration for decentralized content storage
- [ ] NFT-gated content support
- [ ] Creator analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Community features and messaging
- [ ] Multi-chain support

---

Built with ❤️ on Base
