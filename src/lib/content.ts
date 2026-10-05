export interface Article {
  slug: string
  title: string
  date: string
  category: 'Global Market Update' | 'Nigeria Fixed Income' | 'Equities' | 'Personal Finance'
  readMins: number
  summary: string
  takeaways: string[]
  body: { h?: string; p: string }[]
  chart?: { label: string; values: number[] }
}

export const ARTICLES: Article[] = [
  {
    slug: 'global-market-update-week-ended-2-october-2026',
    title: 'Global Market Update for the Week Ended 2nd October 2026',
    date: '2026-10-03',
    category: 'Global Market Update',
    readMins: 4,
    summary: 'The US economy presented mixed signals: Q2 GDP growth was revised upward to 2.20% annualised while manufacturing PMIs stayed in contraction territory.',
    takeaways: [
      'US Q2 GDP revised up to 2.20% annualised',
      'Nonfarm payrolls beat expectations at 162,000',
      'Treasury yields eased as markets priced a December cut',
      'Implication: dollar-fund yields likely stable near 7%',
    ],
    body: [
      { p: 'The US economy presented mixed signals over the week. Second-quarter GDP growth was revised upward to 2.20% annualised, supported by resilient consumer spending, while the ISM manufacturing index remained below the 50-point threshold for a sixth consecutive month.' },
      { h: 'Labour market', p: 'Nonfarm payrolls rose by 162,000, well above expectations, and the unemployment rate held steady. Wage growth moderated slightly, easing fears of a renewed inflationary push.' },
      { h: 'Rates and the Fed', p: 'Federal Reserve officials struck a balanced tone. Futures markets now assign a higher probability to a 25bp cut in December, and the 10-year Treasury yield eased to around 4.1%.' },
      { h: 'What it means for Alpha10 investors', p: 'Softer US yields are supportive for Nigerian Eurobonds, which make up the bulk of the Alpha10 Dollar Fund. We expect dollar-fund yields to remain broadly stable, and continue to recommend dollar exposure as a hedge against naira volatility.' },
    ],
    chart: { label: 'US 10Y yield (%) · last 8 weeks', values: [4.38, 4.31, 4.29, 4.24, 4.27, 4.19, 4.15, 4.12] },
  },
  {
    slug: 'nigeria-fixed-income-october-2026',
    title: 'T-bill Yields Hold Firm as CBN Keeps Liquidity Tight',
    date: '2026-10-01',
    category: 'Nigeria Fixed Income',
    readMins: 3,
    summary: 'Stop rates at the latest NTB auction were broadly unchanged, with the 364-day bill clearing near 18.75%. Demand remained strong, oversubscribed 2.4x.',
    takeaways: ['364-day stop rate ~18.75%', 'Auction 2.4x oversubscribed', 'Treasury Backed Investment pays +100bps above instrument rate'],
    body: [
      { p: 'The Central Bank’s latest Nigerian Treasury Bills auction saw stop rates broadly unchanged across tenors, with the 364-day bill clearing near 18.75%. Total subscriptions were about 2.4 times the amount offered, reflecting healthy appetite from pension funds and banks.' },
      { h: 'Outlook', p: 'With the monetary policy stance still restrictive, we expect yields to stay elevated through Q4. Investors looking to lock in current rates may consider the 364-day Treasury Backed Investment, which pays 100 basis points above the instrument rate.' },
    ],
    chart: { label: '364-day NTB stop rate (%)', values: [18.2, 18.4, 18.5, 18.9, 18.8, 18.7, 18.75, 18.75] },
  },
  {
    slug: 'ngx-weekly-banking-stocks-lead',
    title: 'NGX Weekly: Banking Stocks Lead as Recapitalisation Nears Completion',
    date: '2026-09-27',
    category: 'Equities',
    readMins: 3,
    summary: 'The NGX All-Share Index gained 1.4% for the week, led by tier-one banks as recapitalisation exercises approach their final deadlines.',
    takeaways: ['ASI +1.4% w/w', 'Banking index +3.2%', 'Foreign participation edging higher'],
    body: [
      { p: 'Nigerian equities extended their rally, with the All-Share Index gaining 1.4% for the week. Tier-one banks led the advance as investors positioned ahead of the recapitalisation deadline.' },
      { h: 'Sector view', p: 'Banking stocks rose 3.2% on aggregate, while industrials were flat. We remain constructive on fundamentally strong names but advise clients to size equity exposure in line with their risk profile.' },
    ],
    chart: { label: 'NGX ASI (thousands)', values: [136.2, 137.1, 138.4, 137.9, 139.6, 140.2, 141.0, 142.4] },
  },
  {
    slug: 'dollar-savings-guide',
    title: 'A Practical Guide to Saving in Dollars from Nigeria',
    date: '2026-09-20',
    category: 'Personal Finance',
    readMins: 5,
    summary: 'Why holding part of your wealth in dollars matters, and how to choose between FX Liquidity Management Flex and the Alpha10 Dollar Fund.',
    takeaways: ['Dollar Fund from $100', 'FX Flex for shorter horizons', 'Both earn more than a domiciliary account'],
    body: [
      { p: 'Currency diversification protects your purchasing power. A domiciliary account keeps your dollars safe but typically earns nothing. Alpha10’s dollar products put those dollars to work.' },
      { h: 'Dollar Fund vs FX Flex', p: 'The Alpha10 Dollar Fund invests mostly in Nigerian sovereign and corporate Eurobonds and suits longer horizons. FX Liquidity Management Flex invests in USD money market and fixed income instruments with a 90-day lock-in and quarterly compounding.' },
    ],
  },
  {
    slug: 'global-market-update-week-ended-25-september-2026',
    title: 'Global Market Update for the Week Ended 25th September 2026',
    date: '2026-09-26',
    category: 'Global Market Update',
    readMins: 4,
    summary: 'Inflation data surprised slightly to the downside, reinforcing expectations of gradual easing from major central banks.',
    takeaways: ['Core PCE softer than expected', 'Oil steady near $72', 'Equities near record highs'],
    body: [
      { p: 'Core PCE inflation came in slightly below expectations, reinforcing the view that disinflation remains on track. Global equities hovered near record highs while oil prices were steady.' },
    ],
  },
]

export const FAQS = [
  { q: 'Do you have products for every category of investor?', a: 'Yes — we offer generic and customised investment options for individuals, corporates and institutional investors, from ₦1,000 in the Money Market Fund to bespoke treasury mandates.' },
  { q: 'How do I subscribe to a product?', a: 'Tap Invest, choose a product, enter an amount and confirm. You can fund from your Alpha10 cash account or pay instantly by bank transfer, card or USSD.' },
  { q: 'How do I redeem my investment?', a: 'Go to Portfolio, select the investment and tap Redeem. You’ll see any early-exit charge before you confirm, and can track your redemption live until it’s paid.' },
  { q: 'How do I switch to another investment plan?', a: 'Use Switch plan from the dashboard or portfolio. Switching between products of the same currency is free and instant.' },
  { q: 'Can my bank account be debited every month?', a: 'Yes. Set up Auto-Invest to move a fixed amount weekly, monthly or quarterly into any product.' },
  { q: 'How do I reset my password or retrieve my username?', a: 'Use “Forgot password?” on the sign-in page. You can reset your password or have your username sent to your registered email instantly.' },
  { q: 'How do I change my username?', a: 'Go to Settings → Security and update your username at any time.' },
  { q: 'Where can I get an investment certificate for a visa application?', a: 'Every investment has a downloadable, embassy-ready certificate under Portfolio → Certificate.' },
  { q: 'Is withholding tax deducted?', a: 'Yes. Withholding tax (WHT) applies to interest income on discretionary products and is shown clearly before you invest.' },
  { q: 'Who regulates Alpha10?', a: 'Alpha10 Fund Management Limited is registered and regulated by the Securities and Exchange Commission (SEC), Nigeria. Mutual fund assets are held by STL Trustees Limited.' },
]
