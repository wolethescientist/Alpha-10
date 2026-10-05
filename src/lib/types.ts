export type Currency = 'NGN' | 'USD'

export type ProductId = 'tbi' | 'lmi' | 'lmf' | 'fxflex' | 'mmf' | 'dollar' | 'halal'

export type PayoutOption = 'upfront' | 'quarterly' | 'semi-annual' | 'maturity'

export interface Holding {
  id: string
  productId: ProductId
  principal: number
  rate: number // annual % (for funds: current yield)
  startDate: string // ISO
  tenorDays?: number
  payout?: PayoutOption
  status: 'active' | 'redeeming' | 'redeemed'
  goalId?: string
}

export type TxnType = 'deposit' | 'investment' | 'redemption' | 'interest' | 'switch' | 'withdrawal' | 'charge' | 'reward'
export type TxnStatus = 'completed' | 'pending' | 'processing' | 'failed'

export interface Txn {
  id: string
  date: string
  type: TxnType
  productId?: ProductId
  amount: number
  currency: Currency
  status: TxnStatus
  reference: string
  method?: string
  description: string
}

export type RequestStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface RedemptionRequest {
  id: string
  clientId: string
  clientName: string
  holdingId: string
  productId: ProductId
  amount: number // gross requested
  charge: number
  net: number
  currency: Currency
  destination: string
  createdAt: string
  status: RequestStatus
  updatedAt: string
  note?: string
}

export interface Notification {
  id: string
  title: string
  body: string
  date: string
  read: boolean
  kind: 'success' | 'info' | 'warning' | 'market' | 'broadcast'
}

export interface Goal {
  id: string
  name: string
  emoji: string
  target: number
  saved: number
  currency: Currency
  targetDate: string
  productId: ProductId
  monthly: number
}

export interface StandingOrder {
  id: string
  productId: ProductId
  amount: number
  currency: Currency
  frequency: 'weekly' | 'monthly' | 'quarterly'
  startDate: string
  bank: string
  active: boolean
}

export interface ChatMessage {
  id: string
  from: 'client' | 'rm'
  text: string
  date: string
}

export interface Ticket {
  id: string
  subject: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  messages: { from: 'client' | 'support'; text: string; date: string }[]
}

export interface KycDoc {
  id: string
  label: string
  status: 'verified' | 'pending' | 'missing' | 'rejected'
  uploadedAt?: string
}

export interface BankAccount {
  id: string
  bank: string
  number: string
  name: string
  currency: Currency
  primary: boolean
}

export interface Device {
  id: string
  name: string
  location: string
  lastActive: string
  current: boolean
}

export type AccountType = 'individual' | 'joint' | 'corporate'

export interface ClientProfile {
  id: string
  accountNo: string
  type: AccountType
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  username: string
  dob?: string
  address: string
  city: string
  state: string
  bvnMasked: string
  riskProfile: 'Conservative' | 'Moderate' | 'Growth'
  tier: 'Classic' | 'Premier' | 'Private' | 'Institutional'
  joined: string
  rmId: string
  kycStatus: 'verified' | 'pending' | 'incomplete'
  nextOfKin?: { name: string; relationship: string; phone: string }
  referralCode: string
  avatarHue: number
}

export interface ClientAccount {
  profile: ClientProfile
  wallet: Record<Currency, number>
  holdings: Holding[]
  txns: Txn[]
  notifications: Notification[]
  goals: Goal[]
  standingOrders: StandingOrder[]
  chat: ChatMessage[]
  tickets: Ticket[]
  kycDocs: KycDoc[]
  banks: BankAccount[]
  devices: Device[]
  twoFactor: boolean
  watchlist: string[]
  referrals: { name: string; date: string; status: 'joined' | 'invested'; reward: number }[]
  toured: boolean
}

export interface RM {
  id: string
  name: string
  title: string
  phone: string
  email: string
  region: string
  hue: number
}

export interface AdminClientRow {
  id: string
  name: string
  type: AccountType
  tier: ClientProfile['tier']
  aum: number
  region: 'North' | 'Southwest' | 'South-South' | 'South-East'
  rmId: string
  kyc: ClientProfile['kycStatus']
  joined: string
  lastActive: string
  products: ProductId[]
  isDemo?: boolean
}

export interface ActivityItem {
  id: string
  date: string
  text: string
  amount?: number
  currency?: Currency
  kind: 'deposit' | 'investment' | 'redemption' | 'signup' | 'kyc' | 'switch' | 'system'
}
