# Alpha10 Client Portal — Interactive Prototype

A front-end-only prototype of a new client portal and staff console for **Alpha10 Group**. It is built to show directors how the experience would look and feel. Nothing connects to a backend. Balances, transactions, market data and approvals are all simulated in the browser and saved to `localStorage`, so the demo survives a page refresh.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Deploy by pushing the repo to Vercel. `vercel.json` already sends every route to the single-page app.

## Demo logins

| Role | How |
|---|---|
| Client | On **Log in**, pick a persona (Retail, High-net-worth, Corporate) and press **Sign in**, then tap **Autofill demo code** |
| Staff | On **Log in**, switch to **Staff**, press **Sign in**, then tap **Autofill demo code** |

Any 6-digit OTP and any 4-digit transaction PIN are accepted.

The dark **Demo** button in the bottom-right corner (or **Shift + D**) opens the presenter controls:

- Jump between the client portal, the staff console and the mobile view.
- Switch the client persona.
- Push the markets into a rally or a sell-off.
- Credit interest to the client.
- Turn auto-approval of redemptions on or off.
- Reset all demo data.

`/demo` holds a 10-minute presenter script.

## What's inside

**Public website**: six pages (`/`, `/about`, `/services`, `/products`, `/platform`, `/contact`). It has an editorial look: upright Instrument Serif and Geist type on warm paper, with no italics. The motion uses GSAP:
- **Smooth scrolling and page changes:** ScrollSmoother scrolling, and a crimson curtain transition between pages.
- **Hero animation:** headlines build up letter by letter with SplitText, and the logo ribbons draw themselves in with DrawSVG.
- **Scroll-driven sections:**
  - a horizontal scroll through the three businesses
  - pinned PILATE values
  - a pinned phone walkthrough on Platform
  - service lists that stay in view as you scroll
- **Small touches:**
  - product filters that animate between layouts (Flip)
  - a rates marquee that speeds up as you scroll
  - buttons that lean toward the cursor
  - a full-screen mobile menu


**Client portal (`/app`)**
- **Dashboard**:
  - The balance animates as it loads, and interest accrues every second.
  - NGN/USD toggle and a range-selectable growth chart.
  - Allocation donut, holdings, maturities, goals and a live market strip.
  - A guided product tour on first visit.
- **Deposit**: bank transfer (dedicated account with a countdown), card or USSD. A processing animation, confetti and a balance count-up follow.
- **Invest**:
  - All six real Alpha10 products with their real terms: minimums, tenors, payout options, lock-ins and charges.
  - Projected income net of withholding tax (WHT), a comparison table and a returns calculator.
- **Redeem**: early-exit charges shown up front, a PIN step and a live tracker (Requested → Approved → Paid).
- **Switch plan**: rate comparison and a free switch.
- **Withdraw**: from the cash account to the client's bank.
- **Investment certificates**: embassy-ready, downloadable as PDF.
- **Portfolio**: holdings, lock-in progress, interest by product and redemption tracking.
- **Markets**:
  - Live-ticking NGX equities, FX, T-bill and bond yields, and global markets.
  - Watchlist, yield curve and a 5-year projection of the client's portfolio.
- **Insights**: a weekly market-update reader with key takeaways and charts.
- **Goals and Auto-Invest**: goal planner with progress rings, and standing orders with an e-mandate setup.
- **Statements**: custom date ranges, PDF download, CSV export of transactions.
- **Support**: in-app chat with the relationship manager, support tickets and searchable FAQs.
- **Settings**: profile, KYC documents, two-factor authentication, devices, bank accounts, theme and notifications.
- **Extras**:
  - Refer & Earn.
  - Notifications centre.
  - A proposed Non-Interest (Halal) Fund.
  - Light and dark mode, and a hide-balances switch.

**Staff console (`/staff`)**
- **Overview**:
  - AUM, live activity feed and monthly flows.
  - AUM by region and by product, and an RM leaderboard.
- **Clients**: searchable client book and full client files, including live in-portal messaging to the client.
- **Approvals**: maker-checker queue for redemptions and KYC. Approving here updates the client's tracker live.
- **Products & rates**: change a rate or launch a product. Clients see the change instantly and get notified.
- **Broadcasts**: push announcements to every client, with a phone preview.
- **Reports**: regulatory reports, redemption turnaround, channel mix and product performance.

**Onboarding (`/register`)**
- Eight steps:
  1. Account type.
  2. Personal details.
  3. BVN verification.
  4. Next of kin.
  5. Bank account with name lookup.
  6. Risk-profile quiz.
  7. Document upload with a scan animation.
  8. Login setup and e-signature.
- **Fill demo data** fills each step for a fast presentation.

**Mobile (`/mobile`)**: the live portal inside a phone frame.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Recharts, Zustand (persisted), jsPDF and canvas-confetti. GSAP (ScrollTrigger, ScrollSmoother, SplitText, DrawSVG, Flip) drives the public website. Fonts (Playfair Display, Inter, Instrument Serif and Geist) are self-hosted, so the demo works offline.

## Notes

- Rates, prices, client names and research content are illustrative.
- The Alpha10 name, logo and public product terms come from alpha10group.com. This prototype is a pitch to Alpha10 itself.
- Product chart colours come from a palette validated for colour-blind readers in both light and dark mode.
