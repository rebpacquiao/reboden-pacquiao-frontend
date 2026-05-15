# CryptoWallet Dashboard — Frontend

A **Next.js 15 + TypeScript** web application that lets users connect their MetaMask wallet, view live Ethereum account data, explore an NFT minting interface, and track their token portfolio — all powered by the CryptoWallet Backend API.

Built as part of the **Tier 2: Frontend Development** challenge.

---

## Features

- **Wallet connection** — MetaMask integration via ethers.js v6 (`BrowserProvider`)
- **Live account data** — balance, gas price, block number fetched from the backend API
- **NFT minting** — interact with the deployed `CryptoWalletNFT` ERC-721 contract on Sepolia
- **Token portfolio** — displays tracked token balances with a responsive table
- **Balance history** — time-series chart of past ETH snapshots from MongoDB
- **Redux state management** — `walletSlice`, `tokenSlice`, `portfolioSlice`, `contractSlice` with `redux-persist`
- **Dark theme UI** — built with Mantine 9 (violet primary colour)

---

## Prerequisites

| Tool                       | Version                                                     |
| -------------------------- | ----------------------------------------------------------- |
| Node.js                    | 20+                                                         |
| yarn                       | latest                                                      |
| MetaMask browser extension | any recent version                                          |
| Backend API                | running locally on port 4000 **or** pointed at the live URL |

---

## Local Development Setup

```bash
# 1. Install dependencies
cd front-end/crypto-project
yarn install

# 2. Create your environment file
copy .env.example .env.development     # Windows
# cp .env.example .env.development     # macOS / Linux

# 3. Fill in the values (see Environment Variables section below)

# 4. Start the dev server
yarn dev
```

App runs at **http://localhost:3000**

---

## Environment Variables

Create `.env.development` in `front-end/crypto-project/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x81E023EE4aB728BA0782A0aD8290258021Ad0A71
NEXT_PUBLIC_ETHERSCAN_API=https://api.etherscan.io/v2/api
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key_here
```

| Variable                        | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | Base URL of the backend API                 |
| `NEXT_PUBLIC_CONTRACT_ADDRESS`  | Deployed CryptoWalletNFT contract (Sepolia) |
| `NEXT_PUBLIC_ETHERSCAN_API`     | Etherscan v2 API base URL                   |
| `NEXT_PUBLIC_ETHERSCAN_API_KEY` | Your Etherscan API key                      |

> All `NEXT_PUBLIC_*` variables are **baked into the build at compile time**. Changing them after `npm run build` has no effect — you must rebuild.

---

## Available Scripts

```bash
yarn dev          # Start development server (hot reload)
yarn build        # Production build
yarn start        # Start production server (after build)
yarn lint         # ESLint check
yarn tsc --noEmit # TypeScript type check
```

---

## Docker Setup

This app is part of the multi-container stack defined in `docker-compose.yml` at the workspace root.

### Run with Docker Compose (recommended)

```bash
# From the workspace root (d:\onlineTest)
docker compose up --build
```

Frontend is available at **http://localhost:3000**

### Run only the frontend container

```bash
# From front-end/crypto-project/
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 \
  --build-arg NEXT_PUBLIC_CONTRACT_ADDRESS=0x81E023EE4aB728BA0782A0aD8290258021Ad0A71 \
  --build-arg NEXT_PUBLIC_ETHERSCAN_API=https://api.etherscan.io/v2/api \
  --build-arg NEXT_PUBLIC_ETHERSCAN_API_KEY=your_key \
  -t crypto-frontend .

docker run -p 3000:3000 crypto-frontend
```

---

## Key Architectural Decisions

| Decision                                  | Rationale                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Next.js App Router**                    | File-based routing, RSC-compatible, first-class TypeScript support                                                     |
| **`"use client"` boundaries**             | Wallet/MetaMask interaction requires browser APIs; isolated to page-level components                                   |
| **ethers.js v6**                          | Latest API (`BrowserProvider` replacing `Web3Provider`); consistent with backend                                       |
| **Redux Toolkit + redux-persist**         | Centralised, serialisable state; wallet connection and NFT state survive page refreshes                                |
| **`useRef` mint guard**                   | Prevents MetaMask from re-opening during `tx.wait()` — synchronous guard avoids race conditions that `useState` cannot |
| **pendingTxHash in Redux**                | Gives the UI a way to show "Transaction submitted" feedback between `mint()` and `tx.wait()`                           |
| **next.config.ts `output: "standalone"`** | Produces a self-contained `server.js` for the Docker image (no full `node_modules` needed in the final layer)          |

---

## Known Issues / Limitations

- **MetaMask required** — no WalletConnect or other injected provider support yet.
- **Sepolia testnet only** — NFT minting is locked to chain ID 11155111; mainnet minting is not supported.
- **`NEXT_PUBLIC_*` vars baked at build** — environment-specific deployments each require a separate Docker build.
- **No SSR for wallet state** — wallet address is stored in Redux/localStorage; server-side rendering always shows "disconnected" initially, causing a brief hydration flash.
- **No token price feed** — portfolio values are tracked by amount only, not by USD market price.

---

## Live App

**URL:** `https://crypto.rctravelrentals.com`
