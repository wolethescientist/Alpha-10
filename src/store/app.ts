import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityItem,
  AdminClientRow,
  ClientAccount,
  Currency,
  Goal,
  Holding,
  Notification,
  PayoutOption,
  ProductId,
  RedemptionRequest,
  StandingOrder,
  Ticket,
  Txn,
} from '../lib/types'
import { createPersona, seedActivity, seedAdminClients, type PersonaKey } from '../lib/mock'
import { accrued, earlyExitCharge, holdingValue, productMap } from '../lib/products'
import { money, ref, uid } from '../lib/format'
import { useUI } from './ui'

export interface Broadcast {
  id: string
  title: string
  body: string
  audience: string
  date: string
}

interface Session {
  role: 'client' | 'staff'
  clientId: string
}

interface AppState {
  theme: 'light' | 'dark'
  session: Session | null
  activeClientId: string
  accounts: Record<string, ClientAccount>
  redemptions: RedemptionRequest[]
  adminClients: AdminClientRow[]
  activity: ActivityItem[]
  rates: Partial<Record<ProductId, number>>
  enabled: Record<ProductId, boolean>
  broadcasts: Broadcast[]
  autoApprove: boolean
  hideBalances: boolean
  displayCurrency: Currency

  // session
  login: (role: Session['role'], clientId?: string) => void
  logout: () => void
  setTheme: (t: 'light' | 'dark') => void
  setPersona: (k: PersonaKey) => void
  resetDemo: () => void
  setAutoApprove: (v: boolean) => void
  toggleHideBalances: () => void
  setDisplayCurrency: (c: Currency) => void

  // client actions
  register: (acc: ClientAccount) => void
  deposit: (currency: Currency, amount: number, method: string) => Txn
  invest: (o: { productId: ProductId; amount: number; tenorDays?: number; payout?: PayoutOption; source: 'wallet' | 'external'; method?: string; goalId?: string }) => Holding
  requestRedemption: (holdingId: string, amount: number, destination: 'bank' | 'wallet', bankLabel: string) => RedemptionRequest
  switchPlan: (holdingId: string, to: ProductId, tenorDays?: number) => Holding | undefined
  withdrawWallet: (currency: Currency, amount: number, bankLabel: string) => void
  notify: (n: Omit<Notification, 'id' | 'date' | 'read'>, clientId?: string) => void
  markAllRead: () => void
  addGoal: (g: Omit<Goal, 'id' | 'saved'>) => void
  removeGoal: (id: string) => void
  contributeGoal: (id: string, amount: number) => void
  addStandingOrder: (s: Omit<StandingOrder, 'id' | 'active'>) => void
  toggleStandingOrder: (id: string) => void
  removeStandingOrder: (id: string) => void
  sendChat: (text: string) => void
  createTicket: (t: { subject: string; category: string; message: string }) => void
  uploadDoc: (docId: string) => void
  updateProfile: (p: Partial<ClientAccount['profile']>) => void
  setTwoFactor: (v: boolean) => void
  revokeDevice: (id: string) => void
  addBank: (b: { bank: string; number: string; currency: Currency }) => void
  toggleWatch: (symbol: string) => void
  completeTour: () => void
  restartTour: () => void

  // staff actions
  approveRedemption: (id: string) => void
  rejectRedemption: (id: string, note?: string) => void
  verifyKyc: (clientId: string) => void
  setRate: (p: ProductId, rate: number) => void
  setEnabled: (p: ProductId, v: boolean) => void
  broadcast: (title: string, body: string, audience: string) => void

  // demo simulation
  resumeTimers: () => void
  simulateInterest: () => void
  simulateMaturityAlert: () => void
}

const fresh = () => {
  const retail = createPersona('retail')
  const hni = createPersona('hni')
  const corp = createPersona('corporate')
  return {
    accounts: { [retail.profile.id]: retail, [hni.profile.id]: hni, [corp.profile.id]: corp } as Record<string, ClientAccount>,
    activeClientId: retail.profile.id,
    redemptions: [
      {
        id: 'RQ-88213', clientId: 'ac_3', clientName: 'Sahel Agro Processing Ltd', holdingId: 'x', productId: 'lmi' as ProductId,
        amount: 42_000_000, charge: 0, net: 42_000_000, currency: 'NGN' as Currency, destination: 'Access Bank ••2210',
        createdAt: new Date(Date.now() - 3.2 * 3600_000).toISOString(), status: 'pending' as const, updatedAt: new Date().toISOString(),
      },
      {
        id: 'RQ-88207', clientId: 'ac_8', clientName: 'Ngozi Okonkwo', holdingId: 'x', productId: 'mmf' as ProductId,
        amount: 1_250_000, charge: 0, net: 1_250_000, currency: 'NGN' as Currency, destination: 'Zenith Bank ••8840',
        createdAt: new Date(Date.now() - 6.5 * 3600_000).toISOString(), status: 'pending' as const, updatedAt: new Date().toISOString(),
      },
      {
        id: 'RQ-88190', clientId: 'ac_14', clientName: 'Musa Abubakar', holdingId: 'x', productId: 'dollar' as ProductId,
        amount: 15_000, charge: 312.5, net: 14_687.5, currency: 'USD' as Currency, destination: 'Stanbic Dom ••0912',
        createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(), status: 'pending' as const, updatedAt: new Date().toISOString(),
      },
    ] as RedemptionRequest[],
    adminClients: seedAdminClients(),
    activity: seedActivity(),
    rates: {},
    enabled: { tbi: true, lmi: true, lmf: true, fxflex: true, mmf: true, dollar: true, halal: false } as Record<ProductId, boolean>,
    broadcasts: [] as Broadcast[],
  }
}

function now() {
  return new Date().toISOString()
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      /** Update the active (or given) client's account immutably. */
      const patch = (fn: (a: ClientAccount) => ClientAccount, clientId = get().activeClientId) =>
        set((s) => (s.accounts[clientId] ? { accounts: { ...s.accounts, [clientId]: fn(s.accounts[clientId]!) } } : {}))

      const log = (item: Omit<ActivityItem, 'id' | 'date'>) =>
        set((s) => ({ activity: [{ ...item, id: uid('a_'), date: now() }, ...s.activity].slice(0, 60) }))

      const clientName = (id = get().activeClientId) => {
        const p = get().accounts[id]?.profile
        return p ? (p.companyName ?? `${p.firstName} ${p.lastName}`) : 'Client'
      }

      const payRedemption = (rq: RedemptionRequest) => {
        if (get().redemptions.find((r) => r.id === rq.id)?.status !== 'approved') return
        set((s) => ({ redemptions: s.redemptions.map((r) => (r.id === rq.id ? { ...r, status: 'paid', updatedAt: now() } : r)) }))
        if (!get().accounts[rq.clientId]) return
        patch((a) => {
          const holdings = a.holdings
            .map((h) => {
              if (h.id !== rq.holdingId) return h
              const total = holdingValue(h)
              const remaining = total - rq.amount
              if (remaining <= 1) return { ...h, status: 'redeemed' as const, principal: 0 }
              // rebase the remaining value as fresh principal, keeping the original start date for lock-in purposes
              const ratio = remaining / total
              return { ...h, principal: h.principal * ratio, status: 'active' as const }
            })
            .filter((h) => h.status !== 'redeemed')
          const toWallet = rq.destination === 'Alpha10 cash account'
          const txns: Txn[] = a.txns.map((t) => (t.reference === rq.id ? { ...t, status: 'completed' as const } : t))
          if (rq.charge > 0)
            txns.unshift({ id: uid('t_'), date: now(), type: 'charge', productId: rq.productId, amount: rq.charge, currency: rq.currency, status: 'completed', reference: ref('CHG'), description: `Early redemption charge · ${productMap[rq.productId].short}` })
          if (!toWallet)
            txns.unshift({ id: uid('t_'), date: now(), type: 'withdrawal', amount: rq.net, currency: rq.currency, status: 'completed', reference: ref('WDL'), method: rq.destination, description: `Payout to ${rq.destination}` })
          return {
            ...a,
            holdings,
            txns,
            wallet: toWallet ? { ...a.wallet, [rq.currency]: a.wallet[rq.currency] + rq.net } : a.wallet,
            notifications: [
              { id: uid('n_'), title: 'Redemption paid', body: `${money(rq.net, rq.currency)} has been paid to ${rq.destination}.`, date: now(), read: false, kind: 'success' },
              ...a.notifications,
            ],
          }
        }, rq.clientId)
        if (get().session?.clientId === rq.clientId && get().session?.role === 'client')
          useUI.getState().toast({ kind: 'success', title: 'Redemption paid', body: `${money(rq.net, rq.currency)} sent to ${rq.destination}` })
      }

      return {
        theme: 'light',
        session: null,
        autoApprove: true,
        hideBalances: false,
        displayCurrency: 'NGN',
        ...fresh(),

        login: (role, clientId) => set((s) => ({ session: { role, clientId: clientId ?? s.activeClientId }, activeClientId: clientId ?? s.activeClientId })),
        logout: () => set({ session: null }),
        setTheme: (theme) => {
          document.documentElement.classList.toggle('dark', theme === 'dark')
          set({ theme })
        },
        setPersona: (k) => {
          const acc = createPersona(k)
          set((s) => ({ accounts: { ...s.accounts, [acc.profile.id]: acc }, activeClientId: acc.profile.id, session: s.session?.role === 'client' ? { role: 'client', clientId: acc.profile.id } : s.session }))
        },
        resetDemo: () => set((s) => ({ ...fresh(), session: s.session ? { ...s.session, clientId: 'c_retail' } : null, autoApprove: true })),
        setAutoApprove: (autoApprove) => set({ autoApprove }),
        toggleHideBalances: () => set((s) => ({ hideBalances: !s.hideBalances })),
        setDisplayCurrency: (displayCurrency) => set({ displayCurrency }),

        register: (acc) => {
          set((s) => ({
            accounts: { ...s.accounts, [acc.profile.id]: acc },
            activeClientId: acc.profile.id,
            session: { role: 'client', clientId: acc.profile.id },
          }))
          log({ kind: 'signup', text: `${acc.profile.companyName ?? acc.profile.firstName + ' ' + acc.profile.lastName} opened a new account online` })
        },

        deposit: (currency, amount, method) => {
          const txn: Txn = { id: uid('t_'), date: now(), type: 'deposit', amount, currency, status: 'completed', reference: ref('DEP'), method, description: `Deposit via ${method}` }
          patch((a) => ({
            ...a,
            wallet: { ...a.wallet, [currency]: a.wallet[currency] + amount },
            txns: [txn, ...a.txns],
            notifications: [{ id: uid('n_'), title: 'Deposit received', body: `${money(amount, currency)} has been credited to your ${currency} cash account.`, date: now(), read: false, kind: 'success' }, ...a.notifications],
          }))
          log({ kind: 'deposit', text: `${clientName()} deposited via ${method}`, amount, currency })
          return txn
        },

        invest: ({ productId, amount, tenorDays, payout, source, method, goalId }) => {
          const p = productMap[productId]
          const rate = (tenorDays && p.tenors?.find((t) => t.days === tenorDays)?.rate) || get().rates[productId] || p.rate
          const holding: Holding = { id: uid('h_'), productId, principal: amount, rate, startDate: now(), tenorDays, payout, status: 'active', goalId }
          patch((a) => {
            const txns: Txn[] = []
            if (source === 'external')
              txns.push({ id: uid('t_'), date: now(), type: 'deposit', amount, currency: p.currency, status: 'completed', reference: ref('DEP'), method, description: `Deposit via ${method}` })
            txns.unshift({ id: uid('t_'), date: now(), type: 'investment', productId, amount, currency: p.currency, status: 'completed', reference: ref('INV'), description: `Subscription · ${p.name}` })
            return {
              ...a,
              wallet: source === 'wallet' ? { ...a.wallet, [p.currency]: a.wallet[p.currency] - amount } : a.wallet,
              holdings: [holding, ...a.holdings],
              txns: [...txns, ...a.txns],
              goals: goalId ? a.goals.map((g) => (g.id === goalId ? { ...g, saved: g.saved + amount } : g)) : a.goals,
              notifications: [{ id: uid('n_'), title: 'Investment confirmed', body: `${money(amount, p.currency)} invested in ${p.name}. Your certificate is ready.`, date: now(), read: false, kind: 'success' }, ...a.notifications],
            }
          })
          log({ kind: 'investment', text: `${clientName()} invested in ${p.short}`, amount, currency: p.currency })
          return holding
        },

        requestRedemption: (holdingId, amount, destination, bankLabel) => {
          const a = get().accounts[get().activeClientId]!
          const h = a.holdings.find((x) => x.id === holdingId)!
          const p = productMap[h.productId]
          const charge = earlyExitCharge(h, amount)
          const rq: RedemptionRequest = {
            id: `RQ-${Math.floor(88300 + Math.random() * 600)}`,
            clientId: a.profile.id,
            clientName: clientName(),
            holdingId,
            productId: h.productId,
            amount,
            charge,
            net: amount - charge,
            currency: p.currency,
            destination: destination === 'wallet' ? 'Alpha10 cash account' : bankLabel,
            createdAt: now(),
            status: 'pending',
            updatedAt: now(),
          }
          set((s) => ({ redemptions: [rq, ...s.redemptions] }))
          patch((acc) => ({
            ...acc,
            holdings: acc.holdings.map((x) => (x.id === holdingId ? { ...x, status: 'redeeming' } : x)),
            txns: [{ id: uid('t_'), date: now(), type: 'redemption', productId: h.productId, amount, currency: p.currency, status: 'processing', reference: rq.id, description: `Redemption · ${p.name}` }, ...acc.txns],
            notifications: [{ id: uid('n_'), title: 'Redemption request received', body: `We’re processing your ${money(amount, p.currency)} redemption (${rq.id}).`, date: now(), read: false, kind: 'info' }, ...acc.notifications],
          }))
          log({ kind: 'redemption', text: `${clientName()} requested a redemption from ${p.short}`, amount, currency: p.currency })
          if (get().autoApprove) {
            setTimeout(() => get().approveRedemption(rq.id), 3500)
          }
          return rq
        },

        switchPlan: (holdingId, to, tenorDays) => {
          const a = get().accounts[get().activeClientId]!
          const h = a.holdings.find((x) => x.id === holdingId)
          if (!h) return
          const from = productMap[h.productId]
          const target = productMap[to]
          const value = holdingValue(h)
          const rate = (tenorDays && target.tenors?.find((t) => t.days === tenorDays)?.rate) || get().rates[to] || target.rate
          const nh: Holding = { id: uid('h_'), productId: to, principal: value, rate, startDate: now(), tenorDays, payout: tenorDays ? 'maturity' : undefined, status: 'active' }
          patch((acc) => ({
            ...acc,
            holdings: [nh, ...acc.holdings.filter((x) => x.id !== holdingId)],
            txns: [{ id: uid('t_'), date: now(), type: 'switch', productId: to, amount: value, currency: target.currency, status: 'completed', reference: ref('SWT'), description: `Switched ${from.short} → ${target.short}` }, ...acc.txns],
            notifications: [{ id: uid('n_'), title: 'Plan switched', body: `${money(value, target.currency)} moved from ${from.short} to ${target.short}.`, date: now(), read: false, kind: 'success' }, ...acc.notifications],
          }))
          log({ kind: 'switch', text: `${clientName()} switched ${from.short} → ${target.short}`, amount: value, currency: target.currency })
          return nh
        },

        withdrawWallet: (currency, amount, bankLabel) => {
          patch((a) => ({
            ...a,
            wallet: { ...a.wallet, [currency]: a.wallet[currency] - amount },
            txns: [{ id: uid('t_'), date: now(), type: 'withdrawal', amount, currency, status: 'completed', reference: ref('WDL'), method: bankLabel, description: `Payout to ${bankLabel}` }, ...a.txns],
            notifications: [{ id: uid('n_'), title: 'Withdrawal sent', body: `${money(amount, currency)} is on its way to ${bankLabel}.`, date: now(), read: false, kind: 'success' }, ...a.notifications],
          }))
        },

        notify: (n, clientId) => patch((a) => ({ ...a, notifications: [{ ...n, id: uid('n_'), date: now(), read: false }, ...a.notifications] }), clientId),
        markAllRead: () => patch((a) => ({ ...a, notifications: a.notifications.map((n) => ({ ...n, read: true })) })),

        addGoal: (g) => patch((a) => ({ ...a, goals: [...a.goals, { ...g, id: uid('g_'), saved: 0 }] })),
        removeGoal: (id) => patch((a) => ({ ...a, goals: a.goals.filter((g) => g.id !== id) })),
        contributeGoal: (id, amount) => {
          const g = get().accounts[get().activeClientId]!.goals.find((x) => x.id === id)
          if (!g) return
          get().invest({ productId: g.productId, amount, source: 'wallet', goalId: id })
        },

        addStandingOrder: (so) => {
          patch((a) => ({ ...a, standingOrders: [...a.standingOrders, { ...so, id: uid('so_'), active: true }] }))
          get().notify({ title: 'Auto-invest scheduled', body: `${money(so.amount, so.currency)} ${so.frequency} into ${productMap[so.productId].short}.`, kind: 'success' })
        },
        toggleStandingOrder: (id) => patch((a) => ({ ...a, standingOrders: a.standingOrders.map((s) => (s.id === id ? { ...s, active: !s.active } : s)) })),
        removeStandingOrder: (id) => patch((a) => ({ ...a, standingOrders: a.standingOrders.filter((s) => s.id !== id) })),

        sendChat: (text) => {
          const clientId = get().activeClientId
          patch((a) => ({ ...a, chat: [...a.chat, { id: uid('c_'), from: 'client', text, date: now() }] }))
          useUI.getState().setRmTyping(true)
          const t = text.toLowerCase()
          const reply =
            /redeem|withdraw|liquidat/.test(t) ? 'You can redeem instantly from Portfolio → select the investment → Redeem. Flex withdrawals land within 48 hours, and I’ll keep an eye on it for you.' :
            /certificate|visa|embassy/.test(t) ? 'Your investment certificate is available under Portfolio → Certificates. It’s accepted by embassies for visa applications — download it as a PDF any time.' :
            /rate|yield|return|interest/.test(t) ? 'Our 364-day Treasury Backed Investment is currently paying 19.75% p.a., and Liquidity Management goes up to 21% for 1 year. Want me to book something for you?' :
            /dollar|usd|fx|eurobond/.test(t) ? 'For dollar exposure, the Alpha10 Dollar Fund (from $100) invests in Eurobonds at about 7.4%, while FX Flex gives more liquidity after 90 days.' :
            /halal|islam|non-interest|sharia/.test(t) ? 'Our non-interest offering is being finalised with our Shariah advisory board. I’ll notify you the moment it’s live.' :
            /hello|hi|good (morning|afternoon|evening)/.test(t) ? 'Hello! Great to hear from you. How can I help with your portfolio today?' :
            /thank/.test(t) ? 'You’re very welcome — always a pleasure. 😊' :
            'Thanks for reaching out — I’ve noted this and will get back to you shortly. Is there anything else I can help with in the meantime?'
          setTimeout(() => {
            useUI.getState().setRmTyping(false)
            patch((a) => ({ ...a, chat: [...a.chat, { id: uid('c_'), from: 'rm', text: reply, date: now() }] }), clientId)
          }, 1800 + Math.random() * 900)
        },

        createTicket: ({ subject, category, message }) => {
          const tk: Ticket = { id: `TCK-${Math.floor(10500 + Math.random() * 400)}`, subject, category, status: 'open', createdAt: now(), messages: [{ from: 'client', text: message, date: now() }] }
          const clientId = get().activeClientId
          patch((a) => ({ ...a, tickets: [tk, ...a.tickets] }))
          setTimeout(() => {
            patch((a) => ({
              ...a,
              tickets: a.tickets.map((t) => (t.id === tk.id ? { ...t, status: 'in-progress', messages: [...t.messages, { from: 'support', text: 'Thanks — a member of our Customer Experience team has picked this up and will respond within 2 business hours.', date: now() }] } : t)),
            }), clientId)
          }, 4000)
        },

        uploadDoc: (docId) => {
          patch((a) => ({ ...a, kycDocs: a.kycDocs.map((d) => (d.id === docId ? { ...d, status: 'pending', uploadedAt: now() } : d)), profile: { ...a.profile, kycStatus: 'pending' } }))
          log({ kind: 'kyc', text: `${clientName()} uploaded a KYC document` })
        },
        updateProfile: (p) => patch((a) => ({ ...a, profile: { ...a.profile, ...p } })),
        setTwoFactor: (v) => patch((a) => ({ ...a, twoFactor: v })),
        revokeDevice: (id) => patch((a) => ({ ...a, devices: a.devices.filter((d) => d.id !== id) })),
        addBank: ({ bank, number, currency }) =>
          patch((a) => ({
            ...a,
            banks: [...a.banks, { id: uid('b_'), bank, number, currency, name: (a.profile.companyName ?? `${a.profile.firstName} ${a.profile.lastName}`).toUpperCase(), primary: a.banks.length === 0 }],
          })),
        toggleWatch: (symbol) => patch((a) => ({ ...a, watchlist: a.watchlist.includes(symbol) ? a.watchlist.filter((s) => s !== symbol) : [...a.watchlist, symbol] })),
        completeTour: () => patch((a) => ({ ...a, toured: true })),
        restartTour: () => patch((a) => ({ ...a, toured: false })),

        approveRedemption: (id) => {
          const rq = get().redemptions.find((r) => r.id === id)
          if (!rq || rq.status !== 'pending') return
          set((s) => ({ redemptions: s.redemptions.map((r) => (r.id === id ? { ...r, status: 'approved', updatedAt: now() } : r)) }))
          if (get().accounts[rq.clientId]) {
            get().notify({ title: 'Redemption approved', body: `${rq.id} has been approved and is being paid out.`, kind: 'info' }, rq.clientId)
            setTimeout(() => payRedemption({ ...rq, status: 'approved' }), 3500)
          } else {
            setTimeout(() => set((s) => ({ redemptions: s.redemptions.map((r) => (r.id === id ? { ...r, status: 'paid', updatedAt: now() } : r)) })), 3500)
          }
        },
        rejectRedemption: (id, note) => {
          const rq = get().redemptions.find((r) => r.id === id)
          if (!rq) return
          set((s) => ({ redemptions: s.redemptions.map((r) => (r.id === id ? { ...r, status: 'rejected', note, updatedAt: now() } : r)) }))
          if (get().accounts[rq.clientId])
            patch((a) => ({
              ...a,
              holdings: a.holdings.map((h) => (h.id === rq.holdingId ? { ...h, status: 'active' } : h)),
              txns: a.txns.map((t) => (t.reference === rq.id ? { ...t, status: 'failed' } : t)),
              notifications: [{ id: uid('n_'), title: 'Redemption declined', body: note || 'Please contact your relationship manager for details.', date: now(), read: false, kind: 'warning' }, ...a.notifications],
            }), rq.clientId)
        },
        verifyKyc: (clientId) => {
          if (get().accounts[clientId]) {
            patch((a) => ({
              ...a,
              profile: { ...a.profile, kycStatus: 'verified' },
              kycDocs: a.kycDocs.map((d) => ({ ...d, status: 'verified', uploadedAt: d.uploadedAt ?? now() })),
              notifications: [{ id: uid('n_'), title: 'You’re fully verified ✅', body: 'Your KYC is complete. All investment limits have been lifted.', date: now(), read: false, kind: 'success' }, ...a.notifications],
            }), clientId)
            log({ kind: 'kyc', text: `${clientName(clientId)}’s KYC was verified` })
          } else {
            set((s) => ({ adminClients: s.adminClients.map((c) => (c.id === clientId ? { ...c, kyc: 'verified' } : c)) }))
          }
        },
        setRate: (p, rate) => set((s) => ({ rates: { ...s.rates, [p]: rate } })),
        setEnabled: (p, v) => {
          set((s) => ({ enabled: { ...s.enabled, [p]: v } }))
          if (v)
            for (const id of Object.keys(get().accounts))
              get().notify({ title: `New: ${productMap[p].name}`, body: productMap[p].tagline, kind: 'broadcast' }, id)
        },
        broadcast: (title, body, audience) => {
          set((s) => ({ broadcasts: [{ id: uid('bc_'), title, body, audience, date: now() }, ...s.broadcasts] }))
          for (const id of Object.keys(get().accounts)) get().notify({ title, body, kind: 'broadcast' }, id)
        },

        // timers don't survive a page reload, so pick up in-flight redemptions on start
        resumeTimers: () => {
          for (const rq of get().redemptions) {
            if (rq.status === 'approved') setTimeout(() => payRedemption(rq), 1500)
            else if (rq.status === 'pending' && get().autoApprove && get().accounts[rq.clientId]) setTimeout(() => get().approveRedemption(rq.id), 2000)
          }
        },

        simulateInterest: () => {
          const a = get().accounts[get().activeClientId]!
          const h = a.holdings.find((x) => productMap[x.productId].compounding || productMap[x.productId].unitPrice)
          if (!h) return
          const p = productMap[h.productId]
          const amt = Math.max(1, accrued(h) * 0.35)
          patch((acc) => ({
            ...acc,
            holdings: acc.holdings.map((x) => (x.id === h.id ? { ...x, principal: x.principal + amt } : x)),
            txns: [{ id: uid('t_'), date: now(), type: 'interest', productId: h.productId, amount: amt, currency: p.currency, status: 'completed', reference: ref('INT'), description: `Quarterly income · ${p.short}` }, ...acc.txns],
            notifications: [{ id: uid('n_'), title: 'Income credited', body: `${money(amt, p.currency)} interest compounded into ${p.short}.`, date: now(), read: false, kind: 'success' }, ...acc.notifications],
          }))
          useUI.getState().toast({ kind: 'success', title: 'Interest credited', body: `${money(amt, p.currency)} added to ${p.short}` })
        },
        simulateMaturityAlert: () => {
          get().notify({ title: 'Investment maturing in 7 days', body: 'Your Treasury Backed Investment matures next week. Choose to roll over or redeem.', kind: 'warning' })
          useUI.getState().toast({ kind: 'info', title: 'Maturity reminder', body: 'Treasury Backed Investment matures in 7 days' })
        },
      }
    },
    {
      name: 'alpha10-app',
      version: 3,
      partialize: (s) => {
        // functions are not persisted by zustand; everything else is
        return s
      },
    },
  ),
)

export function useAccount() {
  return useApp((s) => s.accounts[s.activeClientId])!
}

export function useRate(p: ProductId) {
  return useApp((s) => s.rates[p] ?? productMap[p].rate)
}
