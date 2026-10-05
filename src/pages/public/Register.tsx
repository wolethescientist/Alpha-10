import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Check, CheckCircle2, FileUp, Loader2, ScanLine, User, Users, Wand2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { celebrate, Processing } from '../../components/flows/shared'
import { Badge, Button, cx, Field, Input, Select, Stepper, SuccessMark } from '../../components/ui'
import { emptyAccount } from '../../lib/mock'
import type { AccountType } from '../../lib/types'
import { useApp } from '../../store/app'
import { AuthShell } from './AuthShell'

const STEPS = ['Account', 'Details', 'Identity', 'Next of kin', 'Bank', 'Risk profile', 'Documents', 'Security']
const BANKS = ['Access Bank', 'Ecobank', 'Fidelity Bank', 'First Bank', 'FCMB', 'Guaranty Trust Bank', 'Providus Bank', 'Stanbic IBTC', 'Sterling Bank', 'UBA', 'Union Bank', 'Wema Bank', 'Zenith Bank']
const STATES = ['Abuja (FCT)', 'Lagos', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Enugu', 'Delta', 'Ogun', 'Anambra', 'Edo', 'Plateau']

const QUIZ = [
  { q: 'What is your main investment goal?', a: ['Protect my capital', 'Steady income', 'Grow my wealth over time'] },
  { q: 'How long do you plan to stay invested?', a: ['Less than 1 year', '1 – 3 years', 'More than 3 years'] },
  { q: 'If your portfolio fell 10% in a month, you would…', a: ['Withdraw everything', 'Wait it out', 'Invest more'] },
]

const DOCS = [
  { id: 'id', label: 'Government-issued ID', hint: 'NIN slip, passport or driver’s licence' },
  { id: 'poa', label: 'Proof of address', hint: 'Utility bill from the last 3 months' },
  { id: 'photo', label: 'Passport photograph', hint: 'Clear, recent, white background' },
  { id: 'sig', label: 'Specimen signature', hint: 'Sign on white paper and snap it' },
]

export default function Register() {
  const register = useApp((s) => s.register)
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [type, setType] = useState<AccountType>('individual')
  const [f, setF] = useState({
    firstName: '', lastName: '', company: '', rc: '', email: '', phone: '', dob: '', address: '', city: '', state: 'Lagos',
    bvn: '', nin: '', kinName: '', kinRel: 'Spouse', kinPhone: '', bank: 'Guaranty Trust Bank', acct: '', username: '', password: '',
  })
  const [bvnState, setBvnState] = useState<'idle' | 'checking' | 'ok'>('idle')
  const [acctName, setAcctName] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [docs, setDocs] = useState<Record<string, 'idle' | 'scanning' | 'done'>>({})
  const [agree, setAgree] = useState({ terms: false, data: false })
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  const fullName = type === 'corporate' ? f.company : `${f.firstName} ${f.lastName}`.trim()
  const score = answers.reduce((a, b) => a + b, 0)
  const risk = score <= 2 ? 'Conservative' : score <= 4 ? 'Moderate' : 'Growth'

  useEffect(() => {
    if (f.acct.length === 10) {
      setAcctName(null)
      const t = setTimeout(() => setAcctName((fullName || 'ACCOUNT HOLDER').toUpperCase()), 900)
      return () => clearTimeout(t)
    }
    setAcctName(null)
  }, [f.acct, f.bank, fullName])

  const demoFill = () => {
    if (step === 1)
      setF((x) => ({ ...x, firstName: 'Adaeze', lastName: 'Nwachukwu', company: 'Brightwater Foods Ltd', rc: 'RC 1849302', email: 'adaeze.n@example.com', phone: '+234 809 555 0161', dob: '1993-05-11', address: '21 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos' }))
    if (step === 2) setF((x) => ({ ...x, bvn: '22184930211', nin: '48291037465' }))
    if (step === 3) setF((x) => ({ ...x, kinName: 'Chinedu Nwachukwu', kinRel: 'Sibling', kinPhone: '+234 803 555 0144' }))
    if (step === 4) setF((x) => ({ ...x, bank: 'Guaranty Trust Bank', acct: '0234918822' }))
    if (step === 5) setAnswers([1, 2, 1])
    if (step === 6) DOCS.forEach((d, i) => setTimeout(() => upload(d.id), i * 250))
    if (step === 7) {
      setF((x) => ({ ...x, username: x.username || (x.firstName || 'adaeze').toLowerCase() + '.n', password: 'Alpha10!secure' }))
      setAgree({ terms: true, data: true })
    }
  }

  const upload = (id: string) => {
    setDocs((d) => ({ ...d, [id]: 'scanning' }))
    setTimeout(() => setDocs((d) => ({ ...d, [id]: 'done' })), 1400)
  }

  const canNext = [
    true,
    type === 'corporate' ? !!(f.company && f.email && f.phone) : !!(f.firstName && f.lastName && f.email && f.phone),
    bvnState === 'ok',
    type === 'corporate' || !!(f.kinName && f.kinPhone),
    !!acctName,
    answers.length === QUIZ.length,
    DOCS.every((d) => docs[d.id] === 'done'),
    !!(f.username && f.password.length >= 8 && agree.terms && agree.data),
  ][step]

  const submit = () => setPhase('processing')

  if (phase !== 'form')
    return (
      <AuthShell>
        <div className="w-full max-w-md">
          {phase === 'processing' ? (
            <Processing
              steps={['Creating your account', 'Running AML & sanctions screening', 'Submitting documents for review', 'Assigning your relationship manager']}
              interval={1000}
              onDone={() => {
                const acc = emptyAccount(
                  {
                    type,
                    firstName: type === 'corporate' ? f.company.split(' ')[0]! : f.firstName,
                    lastName: type === 'corporate' ? f.company.split(' ').slice(1).join(' ') : f.lastName,
                    companyName: type === 'corporate' ? f.company : undefined,
                    email: f.email,
                    phone: f.phone,
                    username: f.username,
                    dob: f.dob,
                    address: f.address,
                    city: f.city,
                    state: f.state,
                    bvnMasked: f.bvn.slice(0, 3) + '•••••' + f.bvn.slice(-3),
                    riskProfile: risk,
                    nextOfKin: type === 'corporate' ? undefined : { name: f.kinName, relationship: f.kinRel, phone: f.kinPhone },
                  },
                  DOCS.map((d) => d.id),
                )
                acc.banks = [{ id: 'b_new', bank: f.bank, number: f.acct, name: acctName ?? '', currency: 'NGN', primary: true }]
                register(acc)
                setPhase('done')
                setTimeout(celebrate, 300)
              }}
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <SuccessMark size={110} />
              <h1 className="mt-6 font-display text-4xl font-semibold">Welcome to Alpha10{type !== 'corporate' && f.firstName ? `, ${f.firstName}` : ''}!</h1>
              <p className="mt-3 text-muted">Your account is open. Our compliance team is reviewing your documents — you can start investing right away.</p>
              <div className="mt-6 w-full rounded-2xl bg-surface-2 p-5 text-left text-sm">
                <p className="flex justify-between py-1"><span className="text-muted">Risk profile</span><b>{risk}</b></p>
                <p className="flex justify-between py-1"><span className="text-muted">Relationship manager</span><b>Amaka Eze</b></p>
                <p className="flex justify-between py-1"><span className="text-muted">KYC status</span><Badge tone="warning">Under review</Badge></p>
              </div>
              <Button size="lg" className="mt-8 w-full" onClick={() => nav('/app')}>
                Go to my dashboard
              </Button>
            </div>
          )}
        </div>
      </AuthShell>
    )

  return (
    <AuthShell
      aside={
        <>
          <p className="font-display text-5xl leading-tight font-semibold">
            Open your account
            <br />
            <span className="text-gold-300">in minutes.</span>
          </p>
          <ul className="mt-8 space-y-3 text-white/75">
            {['BVN verified instantly with NIBSS', 'Upload documents from your phone', 'Personalised product recommendations', 'A dedicated relationship manager'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-gold-400" /> {t}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">
            Step {step + 1} of {STEPS.length} · <span className="text-ink">{STEPS[step]}</span>
          </p>
          {step > 0 && (
            <button onClick={demoFill} className="flex items-center gap-1.5 rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-gold-600 dark:text-gold-300">
              <Wand2 className="size-3.5" /> Fill demo data
            </button>
          )}
        </div>
        <div className="mb-8 hidden sm:block">
          <Stepper steps={STEPS} current={step} />
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-line sm:hidden">
          <motion.div className="h-full bg-brand-700" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <>
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            {step === 0 && (
              <div>
                <h1 className="font-display text-3xl font-semibold">What kind of account?</h1>
                <p className="mt-2 text-muted">You can add more account types later.</p>
                <div className="mt-6 grid gap-3">
                  {[
                    { id: 'individual' as const, icon: User, t: 'Individual', d: 'Invest in your own name' },
                    { id: 'joint' as const, icon: Users, t: 'Joint', d: 'Invest with a spouse or family member' },
                    { id: 'corporate' as const, icon: Building2, t: 'Corporate / Institutional', d: 'For companies, trusts and cooperatives' },
                  ].map((o) => (
                    <button key={o.id} onClick={() => setType(o.id)} className={cx('flex items-center gap-4 rounded-2xl border p-5 text-left transition', type === o.id ? 'border-brand-700 bg-brand-700/[0.04] ring-1 ring-brand-700' : 'border-line hover:border-brand-700/30')}>
                      <span className={cx('grid size-12 place-items-center rounded-xl', type === o.id ? 'bg-brand-700 text-white' : 'bg-surface-2 text-muted')}>
                        <o.icon className="size-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold">{o.t}</span>
                        <span className="block text-sm text-muted">{o.d}</span>
                      </span>
                      {type === o.id && <Check className="size-5 text-brand-700" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {type === 'corporate' ? (
                  <>
                    <Field label="Company name" className="sm:col-span-2"><Input value={f.company} onChange={set('company')} /></Field>
                    <Field label="RC number"><Input value={f.rc} onChange={set('rc')} /></Field>
                    <Field label="Date of incorporation"><Input type="date" value={f.dob} onChange={set('dob')} /></Field>
                  </>
                ) : (
                  <>
                    <Field label="First name"><Input value={f.firstName} onChange={set('firstName')} /></Field>
                    <Field label="Last name"><Input value={f.lastName} onChange={set('lastName')} /></Field>
                    <Field label="Date of birth"><Input type="date" value={f.dob} onChange={set('dob')} /></Field>
                  </>
                )}
                <Field label="Phone number"><Input value={f.phone} onChange={set('phone')} placeholder="+234" /></Field>
                <Field label="Email address" className="sm:col-span-2"><Input type="email" value={f.email} onChange={set('email')} /></Field>
                <Field label="Residential / business address" className="sm:col-span-2"><Input value={f.address} onChange={set('address')} /></Field>
                <Field label="City"><Input value={f.city} onChange={set('city')} /></Field>
                <Field label="State">
                  <Select value={f.state} onChange={set('state')}>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-display text-3xl font-semibold">Verify your identity</h1>
                <p className="mt-2 text-muted">We use your BVN to confirm your identity instantly. We never see your bank balances.</p>
                <div className="mt-6 space-y-4">
                  <Field label={type === 'corporate' ? 'BVN of lead signatory' : 'Bank Verification Number (BVN)'} hint="Dial *565*0# to retrieve your BVN">
                    <div className="flex gap-2">
                      <Input value={f.bvn} onChange={(e) => { setF((x) => ({ ...x, bvn: e.target.value.replace(/\D/g, '').slice(0, 11) })); setBvnState('idle') }} inputMode="numeric" placeholder="11 digits" className="num tracking-widest" />
                      <Button
                        variant="secondary"
                        disabled={f.bvn.length !== 11 || bvnState !== 'idle'}
                        onClick={() => {
                          setBvnState('checking')
                          setTimeout(() => setBvnState('ok'), 1800)
                        }}
                        className="shrink-0"
                      >
                        Verify
                      </Button>
                    </div>
                  </Field>
                  <AnimatePresence>
                    {bvnState === 'checking' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
                        <Loader2 className="size-5 animate-spin text-brand-700" /> Verifying with NIBSS…
                      </motion.div>
                    )}
                    {bvnState === 'ok' && (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 rounded-2xl border border-gain/30 bg-gain/[0.06] p-4">
                        <div className="grid size-14 place-items-center rounded-xl bg-gradient-to-br from-stone-300 to-stone-400 text-xl font-semibold text-white">{(f.firstName || f.company || 'A')[0]}</div>
                        <div className="flex-1">
                          <p className="font-semibold">{(type === 'corporate' ? 'Lead signatory' : fullName) || 'Identity'} matched</p>
                          <p className="text-xs text-muted">Name, date of birth and phone number confirmed</p>
                        </div>
                        <CheckCircle2 className="size-6 text-gain" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Field label="NIN (optional)"><Input value={f.nin} onChange={set('nin')} inputMode="numeric" placeholder="11 digits" /></Field>
                </div>
              </div>
            )}

            {step === 3 && (
              type === 'corporate' ? (
                <div className="rounded-2xl bg-surface-2 p-6 text-sm text-muted">Next-of-kin details aren’t required for corporate accounts. Authorised signatories will be captured with your board resolution.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" className="sm:col-span-2"><Input value={f.kinName} onChange={set('kinName')} /></Field>
                  <Field label="Relationship">
                    <Select value={f.kinRel} onChange={set('kinRel')}>
                      {['Spouse', 'Parent', 'Sibling', 'Child', 'Other'].map((r) => <option key={r}>{r}</option>)}
                    </Select>
                  </Field>
                  <Field label="Phone number"><Input value={f.kinPhone} onChange={set('kinPhone')} /></Field>
                </div>
              )
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-muted">Redemptions and income are paid into this account.</p>
                <Field label="Bank">
                  <Select value={f.bank} onChange={set('bank')}>
                    {BANKS.map((b) => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Account number (NUBAN)">
                  <Input value={f.acct} onChange={(e) => setF((x) => ({ ...x, acct: e.target.value.replace(/\D/g, '').slice(0, 10) }))} inputMode="numeric" className="num tracking-widest" placeholder="10 digits" />
                </Field>
                <AnimatePresence>
                  {f.acct.length === 10 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm">
                      {acctName ? <CheckCircle2 className="size-4 text-gain" /> : <Loader2 className="size-4 animate-spin text-muted" />}
                      {acctName ? <b>{acctName}</b> : <span className="text-muted">Resolving account name…</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                {QUIZ.map((q, qi) => (
                  <div key={q.q}>
                    <p className="font-semibold">{q.q}</p>
                    <div className="mt-3 grid gap-2">
                      {q.a.map((a, ai) => (
                        <button key={a} onClick={() => setAnswers((x) => { const n = [...x]; n[qi] = ai; return n })} className={cx('rounded-xl border px-4 py-3 text-left text-sm transition', answers[qi] === ai ? 'border-brand-700 bg-brand-700/[0.05] font-semibold ring-1 ring-brand-700' : 'border-line hover:border-brand-700/30')}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {answers.length === QUIZ.length && answers.every((a) => a !== undefined) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="crimson-gradient rounded-2xl p-5 text-white">
                    <p className="text-xs tracking-[0.16em] text-white/70 uppercase">Your risk profile</p>
                    <p className="mt-1 font-display text-3xl font-semibold">{risk}</p>
                    <p className="mt-1 text-sm text-white/75">
                      We’d suggest starting with {risk === 'Conservative' ? 'the Treasury Backed Investment and Money Market Fund' : risk === 'Moderate' ? 'Liquidity Management and the Dollar Fund' : 'a blend of Liquidity Management, the Dollar Fund and equities via our advisory desk'}.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {DOCS.map((d) => {
                  const st = docs[d.id] ?? 'idle'
                  return (
                    <label key={d.id} className={cx('relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition', st === 'done' ? 'border-gain/50 bg-gain/[0.04]' : 'border-line hover:border-brand-700/40')}>
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={() => upload(d.id)} />
                      {st === 'scanning' && <motion.span className="absolute inset-x-0 h-0.5 bg-brand-600 shadow-[0_0_12px_2px_rgb(201_63_66/0.6)]" initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ repeat: Infinity, duration: 0.9, repeatType: 'reverse' }} />}
                      <span className={cx('grid size-11 place-items-center rounded-xl', st === 'done' ? 'bg-gain text-white' : 'bg-surface-2 text-muted')}>
                        {st === 'done' ? <Check className="size-5" /> : st === 'scanning' ? <ScanLine className="size-5 animate-pulse" /> : <FileUp className="size-5" />}
                      </span>
                      <span className="mt-3 text-sm font-semibold">{d.label}</span>
                      <span className="mt-0.5 text-xs text-muted">{st === 'scanning' ? 'Scanning & checking quality…' : st === 'done' ? 'Uploaded · quality check passed' : d.hint}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Choose a username"><Input value={f.username} onChange={set('username')} /></Field>
                  <Field label="Password" hint="8+ characters"><Input type="password" value={f.password} onChange={set('password')} /></Field>
                </div>
                <div className="space-y-3 rounded-2xl bg-surface-2 p-5 text-sm">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={agree.terms} onChange={(e) => setAgree((a) => ({ ...a, terms: e.target.checked }))} className="mt-0.5 size-4 accent-brand-700" />
                    <span className="text-muted">I confirm the information provided is accurate and I accept the Alpha10 terms and conditions.</span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={agree.data} onChange={(e) => setAgree((a) => ({ ...a, data: e.target.checked }))} className="mt-0.5 size-4 accent-brand-700" />
                    <span className="text-muted">I consent to the processing of my data in line with the Privacy Policy and the Nigeria Data Protection Act.</span>
                  </label>
                </div>
                {fullName && (
                  <div className="rounded-2xl border border-line p-5">
                    <p className="text-xs text-muted">E-signature</p>
                    <p className="mt-1 font-display text-3xl italic">{fullName}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>

        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost">Have an account?</Button>
            </Link>
          )}
          <Button className="flex-1" size="lg" disabled={!canNext} onClick={() => (step === STEPS.length - 1 ? submit() : setStep((s) => s + 1))}>
            {step === STEPS.length - 1 ? 'Open my account' : 'Continue'}
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
