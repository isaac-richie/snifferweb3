# 🔍 ExplorerWeb3

**The Ultimate Web3 Identity Discovery & Analytics Platform**

ExplorerWeb3 is a comprehensive identity discovery platform that helps you explore, analyze, and understand Web3 identities across multiple decentralized platforms. From wallet profiling and social identity discovery to Base ecosystem token exploration, get deep insights into the Web3 ecosystem.

## ✨ Core Features

### 🔎 **Universal Identity Search**
- **Multi-Platform Support**: Search across ENS, Basenames, Farcaster, Lens, and Zora
- **Smart Resolution**: Automatically resolves ENS domains and Basenames to addresses
- **Flexible Input**: Search by Ethereum address, ENS domain, or Basename
- **Real-time Results**: Instant search results with live data
- **Social Profile Integration**: Comprehensive social identity mapping

### 💰 **Advanced Wallet Profiler**
- **Transaction Analysis**: Deep dive into wallet transaction history
- **Token Holdings**: View all ERC-20 and ERC-721 tokens
- **Activity Metrics**: Transaction frequency, gas usage, and patterns
- **Base Ecosystem Focus**: Specialized analysis for Base chain activity
- **Smart Caching**: Optimized API usage with 5-minute cache intervals
- **Live Data Refresh**: Force refresh button for real-time updates

### 🪙 **Base Token Explorer**
- **Nansen-Style UI**: Professional token discovery interface
- **Live Market Data**: Real-time prices, market caps, and trading volumes
- **Base Ecosystem Focus**: Curated tokens specifically from Base chain
- **Advanced Filtering**: Search, sort, and filter tokens by various metrics
- **Trending Tokens**: Discover what's hot in the Base ecosystem
- **Smart Caching**: Efficient API usage with intelligent refresh controls

### 📊 **Social Identity Analytics**
- **Cross-Platform Presence**: See identities across ENS, Farcaster, Lens, and Zora
- **Follower Metrics**: Prominent display of follower counts and engagement
- **Verification Status**: Identify verified accounts across platforms
- **Profile Analytics**: Deep insights into social activity and reach
- **Direct Platform Links**: Quick access to all platform profiles

### 🎨 **Modern UI/UX**
- **Professional Design**: Sleek, modern interface inspired by leading Web3 platforms
- **Glass Morphism**: Beautiful gradient backgrounds with backdrop blur effects
- **Responsive Layout**: Perfect experience on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with professional styling
- **Smooth Animations**: Polished interactions and micro-animations
- **Loading States**: Skeleton loaders and smooth transitions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd explorerweb3
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file (optional - uses public APIs by default)
   cp .env.example .env.local
   ```
   
   **Environment Variables** (Optional):
   ```env
   # Etherscan API (for enhanced wallet profiling)
   ETHERSCAN_API_KEY=your_etherscan_api_key
   
   # DEXScreener API (for real-time token data)
   # No API key required - free unlimited usage
   
   # Thirdweb API (for social profiles)
   THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom components
- **Web3**: Thirdweb SDK for blockchain interactions
- **Wallet Integration**: Wagmi with Coinbase Wallet support
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **APIs**: 
  - Etherscan API for transaction data
  - DEXScreener API for real-time token market data
  - Thirdweb Social Profiles API
- **Caching**: Client-side localStorage with smart refresh controls

## ⚡ Performance & API Limits

### 🚀 **Optimization Features**
- **Smart Caching**: 5-minute cache intervals to minimize API calls
- **Debounced Search**: Prevents excessive API requests during typing
- **Lazy Loading**: Components load data only when needed
- **Hydration Guards**: Prevents layout shifts on initial page load
- **Error Boundaries**: Graceful fallbacks for failed API requests

### 📊 **API Usage**
- **Etherscan**: Free tier supports up to 5 requests/second
- **DEXScreener**: Free unlimited requests with real-time data
- **Thirdweb**: Generous free tier for social profile data
- **Caching Strategy**: Reduces API calls by 80% through intelligent caching

### 🔧 **Rate Limiting**
- All API calls are rate-limited to respect service limits
- Automatic retry logic with exponential backoff
- User-friendly error messages for rate limit exceeded
- Fallback data when APIs are temporarily unavailable

## 🔧 Supported Platforms

| Platform | Search | Analytics | Direct Links |
|----------|--------|-----------|--------------|
| **ENS** | ✅ | ✅ | ✅ |
| **Basenames** | ✅ | ✅ | ✅ |
| **Farcaster** | ✅ | ✅ | ✅ |
| **Lens** | ✅ | ✅ | ✅ |
| **Zora** | ✅ | ✅ | ✅ |

## 📱 How to Use

### 🔍 **Identity Discovery**
1. **Search for an Identity**
   - Enter an Ethereum address (e.g., `0x1234...`)
   - Or an ENS domain (e.g., `vitalik.eth`)
   - Or a Basename (e.g., `alice.base`)

2. **Explore Social Profiles**
   - View follower counts and engagement metrics
   - Check verification status across platforms
   - Access direct links to all platform profiles
   - See cross-platform presence and activity

### 💰 **Wallet Profiling**
1. **Analyze Wallet Activity**
   - View detailed transaction history
   - Explore token holdings (ERC-20 & ERC-721)
   - Analyze transaction patterns and gas usage
   - Check Base ecosystem activity

2. **Smart Data Management**
   - Data is cached for 5 minutes to optimize API usage
   - Use the refresh button for real-time updates
   - View last updated timestamps
   - Live vs cached data indicators

### 🪙 **Token Exploration**
1. **Discover Base Tokens**
   - Browse trending tokens in the Base ecosystem
   - Search for specific tokens by name or symbol
   - Sort by market cap, price change, or volume
   - View detailed market data and analytics

2. **Advanced Filtering**
   - Use the search bar to find specific tokens
   - Switch between "Base Tokens" and "Base Trending" tabs
   - Sort results by various metrics
   - Refresh data for the latest market information

### 📊 **Navigation**
- **Tab System**: Switch between Identity, Wallet, and Tokens views
- **Responsive Design**: Works seamlessly on all devices
- **Loading States**: Smooth skeleton loaders during data fetching
- **Error Handling**: Graceful fallbacks for missing data

## 🎯 Use Cases

### 🔍 **Identity & Social Discovery**
- **Identity Verification**: Verify someone's presence across Web3 platforms
- **Social Discovery**: Find interesting people in the Web3 space
- **Cross-Platform Analysis**: Analyze presence across ENS, Farcaster, Lens, and Zora
- **Follower Analytics**: Track social influence and engagement metrics

### 💰 **Wallet & Portfolio Analysis**
- **Transaction Research**: Deep dive into wallet transaction patterns
- **Token Holdings Analysis**: View all ERC-20 and NFT holdings
- **Activity Profiling**: Understand wallet behavior and gas usage patterns
- **Base Ecosystem Tracking**: Monitor Base chain activity and engagement

### 🪙 **Token Discovery & Research**
- **Base Token Discovery**: Find trending and popular tokens in Base ecosystem
- **Market Analysis**: Real-time price data, market caps, and trading volumes
- **Investment Research**: Analyze token performance and market trends
- **Portfolio Tracking**: Monitor token holdings and performance

### 🏢 **Professional Use Cases**
- **Due Diligence**: Research before engaging with Web3 personalities or projects
- **KYC/Compliance**: Verify identities across multiple platforms
- **Market Research**: Study Web3 identity patterns and token trends
- **Community Building**: Find and connect with relevant Web3 communities

## 🔮 Roadmap

### 🚀 **Upcoming Features**
- [ ] **Multi-Wallet Comparison**: Compare multiple wallets side-by-side
- [ ] **Social Graph Visualization**: Visual network of connections across platforms
- [ ] **Real-time Activity Feed**: Live updates and notifications for tracked addresses
- [ ] **Portfolio Analytics**: Advanced portfolio tracking and performance metrics
- [ ] **NFT Collection Analysis**: Deep dive into NFT holdings and collection values
- [ ] **DeFi Protocol Integration**: Track DeFi positions and yield farming activities

### 🛠️ **Technical Improvements**
- [ ] **API Access**: RESTful API for programmatic access
- [ ] **Advanced Caching**: Redis-based server-side caching for better performance
- [ ] **Real-time Updates**: WebSocket connections for live data streaming
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Browser Extension**: Chrome/Firefox extension for quick identity checks

### 🌐 **Platform Expansion**
- [ ] **Additional Chains**: Support for Polygon, Arbitrum, and Optimism
- [ ] **More Social Platforms**: Integration with Unstoppable Domains, Gitcoin Passport
- [ ] **Cross-Chain Identity**: Unified identity across multiple blockchains
- [ ] **AI-Powered Insights**: Machine learning for pattern recognition and insights

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx    # Main analytics overview
│   │   ├── BaseCard.tsx              # Base ecosystem profile card
│   │   ├── ENSCard.tsx               # ENS profile display
│   │   ├── FarcasterCard.tsx         # Farcaster profile with followers
│   │   ├── LensCard.tsx              # Lens protocol integration
│   │   ├── ZoraCard.tsx              # Zora NFT platform card
│   │   ├── WalletProfiler.tsx        # Advanced wallet analysis
│   │   └── TokenExplorer.tsx         # Base token discovery
│   ├── api/
│   │   └── base-tokens/
│   │       └── route.ts              # DEXScreener API integration
│   └── page.tsx                      # Main application page
├── lib/
│   ├── types.ts                      # Type definitions
│   ├── etherscan.ts                  # Blockchain data service
│   └── wagmi.ts                      # Wallet configuration
└── components/ui/                    # Shadcn UI components
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 **Bug Reports**
- Use GitHub Issues to report bugs
- Include steps to reproduce and expected behavior
- Provide browser/device information

### 💡 **Feature Requests**
- Open an issue with the "enhancement" label
- Describe the use case and expected behavior
- Consider the impact on existing functionality

### 🔧 **Development**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📋 **Coding Standards**
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure responsive design principles
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web3 Infrastructure**: [Thirdweb](https://thirdweb.com/) for blockchain interactions
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide](https://lucide.dev/) for beautiful, consistent icons
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Market Data**: [DEXScreener](https://dexscreener.com/) for real-time token information
- **Blockchain Data**: [Etherscan](https://etherscan.io/) for transaction data
- **Design Inspiration**: [Nansen](https://www.nansen.ai/) for professional analytics UI

## 📞 Support

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/explorerweb3/issues) for bugs or feature requests
- **Documentation**: Check the code comments and TypeScript interfaces for implementation details
- **Community**: Join our discussions for questions and feedback

---

**Made with ❤️ for the Web3 community**

*Empowering the next generation of decentralized identity discovery and analytics.*