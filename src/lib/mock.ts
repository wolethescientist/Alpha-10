import type {
  ActivityItem,
  AdminClientRow,
  ClientAccount,
  ClientProfile,
  Holding,
  ProductId,
  RM,
  Txn,
} from './types'
import { addDays, ref, seeded, uid } from './format'
import { accrued, productMap } from './products'

export const RMS: RM[] = [
  { id: 'rm1', name: 'Amaka Eze', title: 'Senior Relationship Manager', phone: '+234 913 444 4497', email: 'amaka.eze@alpha10group.com', region: 'Southwest', hue: 350 },
  { id: 'rm2', name: 'Yusuf Danladi', title: 'Private Wealth Manager', phone: '+234 913 444 4497', email: 'yusuf.danladi@alpha10group.com', region: 'North', hue: 210 },
  { id: 'rm3', name: 'Tobi Adeyemi', title: 'Institutional Coverage Lead', phone: '+234 913 444 4497', email: 'tobi.adeyemi@alpha10group.com', region: 'Southwest', hue: 30 },
  { id: 'rm4', name: 'Ebiere Douglas', title: 'Relationship Manager', phone: '+234 913 444 4497', email: 'ebiere.douglas@alpha10group.com', region: 'South-South', hue: 160 },
  { id: 'rm5', name: 'Halima Sani', title: 'Relationship Manager, Non-Interest', phone: '+234 913 444 4497', email: 'halima.sani@alpha10group.com', region: 'North', hue: 280 },
]
export const rmMap = Object.fromEntries(RMS.map((r) => [r.id, r])) as Record<string, RM>

export type PersonaKey = 'retail' | 'hni' | 'corporate'

export const PERSONAS: Record<PersonaKey, { label: string; blurb: string }> = {
  retail: { label: 'Retail investor', blurb: 'Chidinma Okafor · Premier · Lagos' },
  hni: { label: 'High-net-worth', blurb: 'Ibrahim Musa Bello · Private · Abuja' },
  corporate: { label: 'Corporate treasury', blurb: 'Kestrel Logistics Ltd · Institutional' },
}

const daysAgo = (n: number) => addDays(new Date(), -n)

function h(productId: ProductId, principal: number, startDaysAgo: number, extra: Partial<Holding> = {}): Holding {
  return {
    id: uid('h_'),
    productId,
    principal,
    rate: extra.tenorDays && productMap[productId].tenors
      ? productMap[productId].tenors!.reduce((best, t) => (Math.abs(t.days - extra.tenorDays!) < Math.abs(best.days - extra.tenorDays!) ? t : best)).rate
      : productMap[productId].rate,
    startDate: daysAgo(startDaysAgo),
    status: 'active',
    ...extra,
  }
}

function historyFor(holdings: Holding[], scale: number, seed: number): Txn[] {
  const rnd = seeded(seed)
  const txns: Txn[] = []
  for (const hd of holdings) {
    const p = productMap[hd.productId]
    txns.push({
      id: uid('t_'),
      date: addDays(hd.startDate, -0.02),
      type: 'deposit',
      amount: hd.principal,
      currency: p.currency,
      status: 'completed',
      reference: ref('DEP'),
      method: rnd() > 0.5 ? 'Bank transfer' : 'Card',
      description: `Deposit to ${p.currency} cash account`,
    })
    txns.push({
      id: uid('t_'),
      date: hd.startDate,
      type: 'investment',
      productId: hd.productId,
      amount: hd.principal,
      currency: p.currency,
      status: 'completed',
      reference: ref('INV'),
      description: `Subscription · ${p.name}`,
    })
    // periodic interest credits for compounding products
    if (p.compounding || p.unitPrice) {
      const started = new Date(hd.startDate).getTime()
      for (let d = 91; ; d += 91) {
        const at = new Date(started + d * 86_400_000)
        if (at > new Date()) break
        txns.push({
          id: uid('t_'),
          date: at.toISOString(),
          type: 'interest',
          productId: hd.productId,
          amount: (hd.principal * hd.rate * 91) / 36500,
          currency: p.currency,
          status: 'completed',
          reference: ref('INT'),
          description: `Quarterly income · ${p.short}`,
        })
      }
    }
  }
  // a couple of past withdrawals and a matured placement
  txns.push({
    id: uid('t_'),
    date: daysAgo(48),
    type: 'redemption',
    productId: 'lmf',
    amount: 250_000 * scale,
    currency: 'NGN',
    status: 'completed',
    reference: ref('RED'),
    description: 'Withdrawal · Liquidity Management Flex',
  })
  txns.push({
    id: uid('t_'),
    date: daysAgo(47),
    type: 'withdrawal',
    amount: 250_000 * scale,
    currency: 'NGN',
    status: 'completed',
    reference: ref('WDL'),
    method: 'GTBank ••4821',
    description: 'Payout to bank account',
  })
  txns.push({
    id: uid('t_'),
    date: daysAgo(130),
    type: 'interest',
    productId: 'tbi',
    amount: 486_250 * scale,
    currency: 'NGN',
    status: 'completed',
    reference: ref('INT'),
    description: 'Maturity interest · Treasury Backed (182 days)',
  })
  return txns.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

function baseAccount(profile: ClientProfile, holdings: Holding[], wallet: { NGN: number; USD: number }, scale: number, seed: number): ClientAccount {
  return {
    profile,
    wallet,
    holdings,
    txns: historyFor(holdings, scale, seed),
    notifications: [
      { id: uid('n_'), title: 'Your September statement is ready', body: 'Download it from Statements.', date: daysAgo(4), read: false, kind: 'info' },
      { id: uid('n_'), title: 'Quarterly income credited', body: 'Interest has been credited to your Flex portfolio.', date: daysAgo(6), read: false, kind: 'success' },
      { id: uid('n_'), title: 'Global Market Update', body: 'US Q2 GDP revised up to 2.20%. Read this week’s insight.', date: daysAgo(2), read: true, kind: 'market' },
    ],
    goals: [],
    standingOrders: [],
    chat: [
      { id: uid('c_'), from: 'rm', text: `Hello ${profile.firstName}, I’m your relationship manager. Message me here any time — I typically reply within minutes during business hours.`, date: daysAgo(20) },
    ],
    tickets: [
      {
        id: 'TCK-10482',
        subject: 'Request for investment certificate (visa application)',
        category: 'Documents',
        status: 'resolved',
        createdAt: daysAgo(35),
        messages: [
          { from: 'client', text: 'Please I need a certificate of investment for my UK visa application.', date: daysAgo(35) },
          { from: 'support', text: 'Your certificate has been issued — you can also download it instantly from Portfolio › Certificates.', date: daysAgo(34) },
        ],
      },
    ],
    kycDocs: [
      { id: 'id', label: 'Government-issued ID', status: 'verified', uploadedAt: daysAgo(300) },
      { id: 'poa', label: 'Proof of address (utility bill)', status: 'verified', uploadedAt: daysAgo(300) },
      { id: 'photo', label: 'Passport photograph', status: 'verified', uploadedAt: daysAgo(300) },
      { id: 'sig', label: 'Specimen signature', status: 'verified', uploadedAt: daysAgo(300) },
    ],
    banks: [
      { id: uid('b_'), bank: 'Guaranty Trust Bank', number: '0123454821', name: `${profile.firstName} ${profile.lastName}`.toUpperCase(), currency: 'NGN', primary: true },
      { id: uid('b_'), bank: 'Zenith Bank (Domiciliary)', number: '5070019934', name: `${profile.firstName} ${profile.lastName}`.toUpperCase(), currency: 'USD', primary: false },
    ],
    devices: [
      { id: 'd1', name: 'Chrome on macOS', location: 'Lagos, NG', lastActive: new Date().toISOString(), current: true },
      { id: 'd2', name: 'Alpha10 iOS · iPhone 16', location: 'Lagos, NG', lastActive: daysAgo(1), current: false },
      { id: 'd3', name: 'Safari on iPad', location: 'Abuja, NG', lastActive: daysAgo(12), current: false },
    ],
    twoFactor: true,
    watchlist: ['DANGCEM', 'MTNN', 'GTCO', 'ZENITHBANK', 'SEPLAT'],
    referrals: [
      { name: 'Tolu A.', date: daysAgo(40), status: 'invested', reward: 5000 },
      { name: 'Kelechi O.', date: daysAgo(12), status: 'joined', reward: 0 },
    ],
    toured: false,
  }
}

export function createPersona(kind: PersonaKey): ClientAccount {
  if (kind === 'hni') {
    const holdings = [
      h('tbi', 85_000_000, 140, { tenorDays: 364, payout: 'semi-annual' }),
      h('lmi', 40_000_000, 62, { tenorDays: 180, payout: 'quarterly' }),
      h('fxflex', 45_000, 210),
      h('dollar', 120_000, 320),
      h('mmf', 12_000_000, 190),
    ]
    const acc = baseAccount(
      {
        id: 'c_hni', accountNo: 'A10-2048817', type: 'individual', firstName: 'Ibrahim', lastName: 'Musa Bello',
        email: 'ibrahim.bello@example.com', phone: '+234 803 555 0142', username: 'ibello', dob: '1971-03-14',
        address: '14 Yedseram Street, Maitama', city: 'Abuja', state: 'FCT', bvnMasked: '222•••••871',
        riskProfile: 'Moderate', tier: 'Private', joined: daysAgo(720), rmId: 'rm2', kycStatus: 'verified',
        nextOfKin: { name: 'Aisha Bello', relationship: 'Spouse', phone: '+234 803 555 0199' }, referralCode: 'IBELLO10', avatarHue: 210,
      },
      holdings, { NGN: 3_450_000, USD: 2_150 }, 20, 7,
    )
    acc.goals = [
      { id: uid('g_'), name: 'Hajj for the family', emoji: '🕋', target: 45_000_000, saved: 28_500_000, currency: 'NGN', targetDate: addDays(new Date(), 300), productId: 'mmf', monthly: 1_500_000 },
      { id: uid('g_'), name: 'Grandchildren’s education', emoji: '🎓', target: 150_000, saved: 61_000, currency: 'USD', targetDate: addDays(new Date(), 2200), productId: 'dollar', monthly: 1_500 },
    ]
    acc.standingOrders = [{ id: uid('so_'), productId: 'mmf', amount: 1_500_000, currency: 'NGN', frequency: 'monthly', startDate: daysAgo(160), bank: 'Guaranty Trust Bank ••4821', active: true }]
    return acc
  }
  if (kind === 'corporate') {
    const holdings = [
      h('tbi', 500_000_000, 75, { tenorDays: 182, payout: 'maturity' }),
      h('lmi', 350_000_000, 25, { tenorDays: 90, payout: 'maturity' }),
      h('fxflex', 250_000, 160),
      h('mmf', 75_000_000, 260),
    ]
    const acc = baseAccount(
      {
        id: 'c_corp', accountNo: 'A10-C-00931', type: 'corporate', firstName: 'Kestrel', lastName: 'Logistics Ltd', companyName: 'Kestrel Logistics Limited',
        email: 'treasury@kestrel-logistics.example', phone: '+234 1 555 0190', username: 'kestrel.treasury',
        address: 'Plot 22, Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos', bvnMasked: 'RC 1•••••3',
        riskProfile: 'Conservative', tier: 'Institutional', joined: daysAgo(540), rmId: 'rm3', kycStatus: 'verified', referralCode: 'KESTREL10', avatarHue: 30,
      },
      holdings, { NGN: 18_200_000, USD: 12_400 }, 120, 11,
    )
    acc.kycDocs = [
      { id: 'cac', label: 'Certificate of Incorporation (CAC)', status: 'verified', uploadedAt: daysAgo(500) },
      { id: 'memart', label: 'Memorandum & Articles of Association', status: 'verified', uploadedAt: daysAgo(500) },
      { id: 'board', label: 'Board resolution', status: 'verified', uploadedAt: daysAgo(500) },
      { id: 'sigs', label: 'Authorised signatories’ IDs', status: 'verified', uploadedAt: daysAgo(500) },
    ]
    acc.banks[0]!.name = 'KESTREL LOGISTICS LIMITED'
    acc.banks[1]!.name = 'KESTREL LOGISTICS LIMITED'
    acc.standingOrders = [{ id: uid('so_'), productId: 'mmf', amount: 25_000_000, currency: 'NGN', frequency: 'monthly', startDate: daysAgo(200), bank: 'Guaranty Trust Bank ••4821', active: true }]
    return acc
  }
  const holdings = [
    h('tbi', 5_000_000, 120, { tenorDays: 364, payout: 'maturity' }),
    h('lmf', 2_450_000, 210),
    h('mmf', 1_820_000, 160),
    h('dollar', 3_200, 250),
  ]
  const acc = baseAccount(
    {
      id: 'c_retail', accountNo: 'A10-1093342', type: 'individual', firstName: 'Chidinma', lastName: 'Okafor',
      email: 'chidinma.okafor@example.com', phone: '+234 806 555 0123', username: 'chidinma.o', dob: '1990-07-22',
      address: '7B Bourdillon Road, Ikoyi', city: 'Lagos', state: 'Lagos', bvnMasked: '221•••••094',
      riskProfile: 'Moderate', tier: 'Premier', joined: daysAgo(420), rmId: 'rm1', kycStatus: 'verified',
      nextOfKin: { name: 'Emeka Okafor', relationship: 'Brother', phone: '+234 806 555 0177' }, referralCode: 'CHIDI10', avatarHue: 350,
    },
    holdings, { NGN: 385_000, USD: 120 }, 1, 3,
  )
  acc.goals = [
    { id: uid('g_'), name: 'Dream home deposit', emoji: '🏡', target: 15_000_000, saved: 6_200_000, currency: 'NGN', targetDate: addDays(new Date(), 540), productId: 'lmf', monthly: 350_000 },
    { id: uid('g_'), name: 'Masters in the UK', emoji: '🎓', target: 25_000, saved: 3_200, currency: 'USD', targetDate: addDays(new Date(), 700), productId: 'dollar', monthly: 600 },
    { id: uid('g_'), name: 'Emergency fund', emoji: '🛟', target: 2_000_000, saved: 1_820_000, currency: 'NGN', targetDate: addDays(new Date(), 90), productId: 'mmf', monthly: 100_000 },
  ]
  acc.standingOrders = [{ id: uid('so_'), productId: 'lmf', amount: 350_000, currency: 'NGN', frequency: 'monthly', startDate: daysAgo(180), bank: 'Guaranty Trust Bank ••4821', active: true }]
  return acc
}

export function emptyAccount(p: Omit<ClientProfile, 'id' | 'accountNo' | 'joined' | 'rmId' | 'kycStatus' | 'referralCode' | 'avatarHue' | 'tier'>, docs: string[]): ClientAccount {
  const profile: ClientProfile = {
    ...p,
    id: uid('c_'),
    accountNo: `A10-${Math.floor(1_100_000 + Math.random() * 800_000)}`,
    joined: new Date().toISOString(),
    rmId: 'rm1',
    kycStatus: 'pending',
    tier: p.type === 'corporate' ? 'Institutional' : 'Classic',
    referralCode: (p.firstName.slice(0, 5) + '10').toUpperCase(),
    avatarHue: Math.floor(Math.random() * 360),
  }
  return {
    profile,
    wallet: { NGN: 0, USD: 0 },
    holdings: [],
    txns: [],
    notifications: [
      { id: uid('n_'), title: `Welcome to Alpha10, ${p.firstName}!`, body: 'Your account is open. Make your first deposit to start investing.', date: new Date().toISOString(), read: false, kind: 'success' },
      { id: uid('n_'), title: 'KYC under review', body: 'Our compliance team is reviewing your documents. This usually takes a few hours.', date: new Date().toISOString(), read: false, kind: 'info' },
    ],
    goals: [],
    standingOrders: [],
    chat: [{ id: uid('c_'), from: 'rm', text: `Welcome to Alpha10, ${p.firstName}! I’m Amaka, your relationship manager. Shall I help you choose your first investment?`, date: new Date().toISOString() }],
    tickets: [],
    kycDocs: [
      { id: 'id', label: 'Government-issued ID', status: docs.includes('id') ? 'pending' : 'missing', uploadedAt: docs.includes('id') ? new Date().toISOString() : undefined },
      { id: 'poa', label: 'Proof of address (utility bill)', status: docs.includes('poa') ? 'pending' : 'missing', uploadedAt: docs.includes('poa') ? new Date().toISOString() : undefined },
      { id: 'photo', label: 'Passport photograph', status: docs.includes('photo') ? 'pending' : 'missing', uploadedAt: docs.includes('photo') ? new Date().toISOString() : undefined },
      { id: 'sig', label: 'Specimen signature', status: docs.includes('sig') ? 'pending' : 'missing', uploadedAt: docs.includes('sig') ? new Date().toISOString() : undefined },
    ],
    banks: [],
    devices: [{ id: 'd1', name: 'Chrome · this device', location: 'Lagos, NG', lastActive: new Date().toISOString(), current: true }],
    twoFactor: false,
    watchlist: ['DANGCEM', 'MTNN', 'GTCO'],
    referrals: [],
    toured: false,
  }
}

export function portfolioTotals(acc: ClientAccount, fx: number) {
  let ngn = acc.wallet.NGN
  let usd = acc.wallet.USD
  let interestNGN = 0
  let interestUSD = 0
  for (const hd of acc.holdings) {
    if (hd.status === 'redeemed') continue
    const p = productMap[hd.productId]
    const a = accrued(hd)
    if (p.currency === 'NGN') {
      ngn += hd.principal + a
      interestNGN += a
    } else {
      usd += hd.principal + a
      interestUSD += a
    }
  }
  return { ngn, usd, totalNGN: ngn + usd * fx, interestNGN, interestUSD, interestTotalNGN: interestNGN + interestUSD * fx }
}

/** Historical portfolio value series, derived from holdings with gentle market noise. */
export function portfolioHistory(acc: ClientAccount, fx: number, days: number) {
  const rnd = seeded(acc.profile.accountNo.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const out: { date: string; value: number }[] = []
  const now = Date.now()
  const step = days <= 7 ? 1 / 4 : days <= 31 ? 1 : days <= 92 ? 1 : days <= 365 ? 3 : 7
  let noise = 0
  for (let d = days; d >= 0; d -= step) {
    const at = new Date(now - d * 86_400_000)
    let v = 0
    for (const hd of acc.holdings) {
      if (new Date(hd.startDate) > at) continue
      const p = productMap[hd.productId]
      const val = hd.principal + accrued(hd, at)
      v += p.currency === 'USD' ? val * fx * (1 - d * 0.00012) : val
    }
    noise = noise * 0.85 + (rnd() - 0.48) * 0.0015
    v += acc.wallet.NGN + acc.wallet.USD * fx
    out.push({ date: at.toISOString(), value: Math.max(0, v * (1 + (d > 0 ? noise : 0))) })
  }
  return out
}

/* ---------------------------- Staff / admin ---------------------------- */

const FIRST = ['Adebayo', 'Ngozi', 'Emeka', 'Fatima', 'Oluwaseun', 'Zainab', 'Chukwudi', 'Aisha', 'Tunde', 'Ifeoma', 'Musa', 'Funke', 'Obinna', 'Hauwa', 'Segun', 'Blessing', 'Kabiru', 'Nkechi', 'Femi', 'Amina', 'Uche', 'Bolanle', 'Sani', 'Chiamaka', 'Gbenga', 'Hadiza', 'Ikenna', 'Yetunde']
const LAST = ['Adeleke', 'Okonkwo', 'Abubakar', 'Balogun', 'Nwosu', 'Ibrahim', 'Eze', 'Lawal', 'Ogunleye', 'Danjuma', 'Okeke', 'Bello', 'Afolabi', 'Umar', 'Chukwu', 'Oyelaran', 'Garba', 'Onyekachi']
const COMPANIES = ['Sahel Agro Processing Ltd', 'Bonny Marine Services', 'Kano Textiles Cooperative', 'Lekki Health Partners', 'Northern Grains Pension Trust', 'Delta Petrochem Staff Fund', 'Abuja Polytechnic Endowment', 'Ikeja Retail Holdings']

export function seedAdminClients(): AdminClientRow[] {
  const rnd = seeded(42)
  const rows: AdminClientRow[] = []
  const regions: AdminClientRow['region'][] = ['North', 'Southwest', 'South-South', 'South-East']
  const products: ProductId[] = ['tbi', 'lmi', 'lmf', 'fxflex', 'mmf', 'dollar']
  for (let i = 0; i < 46; i++) {
    const corp = i % 7 === 3
    const name = corp ? COMPANIES[i % COMPANIES.length]! : `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`
    const aum = corp ? 150e6 + rnd() * 2.4e9 : Math.pow(rnd(), 2.2) * 180e6 + 150_000
    const tier: AdminClientRow['tier'] = corp ? 'Institutional' : aum > 50e6 ? 'Private' : aum > 5e6 ? 'Premier' : 'Classic'
    const ps = products.filter(() => rnd() > 0.55)
    rows.push({
      id: `ac_${i}`,
      name,
      type: corp ? 'corporate' : rnd() > 0.92 ? 'joint' : 'individual',
      tier,
      aum,
      region: regions[Math.floor(rnd() * regions.length)]!,
      rmId: RMS[Math.floor(rnd() * RMS.length)]!.id,
      kyc: rnd() > 0.9 ? 'incomplete' : 'verified',
      joined: daysAgo(Math.floor(rnd() * 900) + 5),
      lastActive: daysAgo(Math.floor(rnd() * 30)),
      products: ps.length ? ps : ['mmf'],
    })
  }
  return rows
}

export function seedActivity(): ActivityItem[] {
  const rnd = seeded(9)
  const kinds: ActivityItem['kind'][] = ['deposit', 'investment', 'redemption', 'signup', 'kyc', 'switch']
  const out: ActivityItem[] = []
  for (let i = 0; i < 14; i++) {
    const k = kinds[Math.floor(rnd() * kinds.length)]!
    const who = `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]![0]}.`
    const amt = Math.round((rnd() * 25e6 + 50_000) / 1000) * 1000
    const text =
      k === 'deposit' ? `${who} deposited` :
      k === 'investment' ? `${who} invested in ${productMap[(['tbi', 'lmi', 'mmf', 'lmf'] as ProductId[])[Math.floor(rnd() * 4)]!].short}` :
      k === 'redemption' ? `${who} requested a redemption` :
      k === 'signup' ? `${who} opened a new account` :
      k === 'kyc' ? `${who}’s KYC was verified` : `${who} switched plans`
    out.push({ id: uid('a_'), date: new Date(Date.now() - (i * 37 + rnd() * 30) * 60_000).toISOString(), text, amount: ['deposit', 'investment', 'redemption'].includes(k) ? amt : undefined, currency: 'NGN', kind: k })
  }
  return out
}
