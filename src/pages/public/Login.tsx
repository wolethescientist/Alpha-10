import { motion } from 'framer-motion'
import { Building2, Eye, EyeOff, Fingerprint, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, cx, Field, Input, Segmented } from '../../components/ui'
import { PERSONAS, type PersonaKey } from '../../lib/mock'
import { useApp } from '../../store/app'
import { AuthShell } from './AuthShell'

const PERSONA_IDS: Record<PersonaKey, string> = { retail: 'c_retail', hni: 'c_hni', corporate: 'c_corp' }
const PERSONA_LOGIN: Record<PersonaKey, string> = { retail: 'chidinma.o', hni: 'ibello', corporate: 'kestrel.treasury' }

export default function Login() {
  const [params] = useSearchParams()
  const [role, setRole] = useState<'client' | 'staff'>(params.get('staff') ? 'staff' : 'client')
  const [persona, setPersona] = useState<PersonaKey>('retail')
  const [username, setUsername] = useState(PERSONA_LOGIN.retail)
  const [password, setPassword] = useState('Alpha10!demo')
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'creds' | 'otp'>('creds')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const login = useApp((s) => s.login)
  const accounts = useApp((s) => s.accounts)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => {
    if (role === 'staff') setUsername('ops.admin@alpha10group.com')
    else setUsername(PERSONA_LOGIN[persona])
  }, [role, persona])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
    }, 900)
  }

  const finish = () => {
    const registered = Object.values(accounts).find((a) => a.profile.username === username || a.profile.email === username)
    const clientId = registered?.profile.id ?? PERSONA_IDS[persona]
    if (role === 'client' && !accounts[clientId]) useApp.getState().setPersona(persona)
    login(role, role === 'client' ? clientId : undefined)
    const from = (loc.state as { from?: string } | null)?.from
    nav(from && from.startsWith(role === 'staff' ? '/staff' : '/app') ? from : role === 'staff' ? '/staff' : '/app')
  }

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <>
          {step === 'creds' ? (
            <motion.div key="creds" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-muted">Sign in to your Alpha10 {role === 'staff' ? 'staff console' : 'account'}.</p>
              <Segmented
                className="mt-7"
                value={role}
                onChange={setRole}
                options={[
                  { value: 'client', label: <span className="flex items-center gap-1.5"><User className="size-3.5" /> Client</span> },
                  { value: 'staff', label: <span className="flex items-center gap-1.5"><Building2 className="size-3.5" /> Staff</span> },
                ]}
              />
              {role === 'client' && (
                <div className="mt-5 rounded-2xl border border-dashed border-gold-400/60 bg-gold-400/[0.06] p-3">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-gold-600 uppercase dark:text-gold-300">Demo account</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {(Object.keys(PERSONAS) as PersonaKey[]).map((k) => (
                      <button key={k} type="button" onClick={() => setPersona(k)} className={cx('rounded-lg px-2 py-1.5 text-xs font-semibold transition', persona === k ? 'bg-brand-700 text-white' : 'bg-surface text-muted hover:text-ink')}>
                        {PERSONAS[k].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Field label={role === 'staff' ? 'Staff email' : 'Username or email'}>
                  <Input prefix={<Mail className="size-4" />} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                </Field>
                <Field label="Password">
                  <Input
                    prefix={<Lock className="size-4" />}
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    suffix={
                      <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                  />
                </Field>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-brand-700" /> Remember this device
                  </label>
                  <Link to="/forgot" className="font-semibold text-brand-700 dark:text-brand-300">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Sign in
                </Button>
                {role === 'client' && (
                  <button type="button" onClick={() => setStep('otp')} className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-semibold text-muted hover:text-ink">
                    <Fingerprint className="size-4" /> Sign in with passkey
                  </button>
                )}
              </form>
              {role === 'client' && (
                <p className="mt-8 text-center text-sm text-muted">
                  New to Alpha10?{' '}
                  <Link to="/register" className="font-semibold text-brand-700 dark:text-brand-300">
                    Open an account
                  </Link>
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <OtpStep onBack={() => setStep('creds')} onDone={finish} destination={role === 'staff' ? 'your authenticator app' : '+234 •••• ••• 0123'} />
            </motion.div>
          )}
        </>
      </div>
    </AuthShell>
  )
}

export function OtpStep({ onDone, onBack, destination }: { onDone: () => void; onBack?: () => void; destination: string }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resend, setResend] = useState(30)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    refs.current[0]?.focus()
    const t = setInterval(() => setResend((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (code.every((c) => c)) {
      setVerifying(true)
      const t = setTimeout(onDone, 1000)
      return () => clearTimeout(t)
    }
  }, [code, onDone])

  const setAt = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length > 1) {
      const next = [...code]
      digits.slice(0, 6 - i).split('').forEach((d, k) => (next[i + k] = d))
      setCode(next)
      refs.current[Math.min(5, i + digits.length)]?.focus()
      return
    }
    const next = [...code]
    next[i] = digits
    setCode(next)
    if (digits && i < 5) refs.current[i + 1]?.focus()
  }

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-700/10 text-brand-700 dark:text-brand-300">
        <ShieldCheck className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">Verify it’s you</h1>
      <p className="mt-2 text-muted">Enter the 6-digit code sent to {destination}.</p>
      <div className="mt-8 flex gap-2 sm:gap-3">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            value={c}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => e.key === 'Backspace' && !c && i > 0 && refs.current[i - 1]?.focus()}
            inputMode="numeric"
            maxLength={6}
            aria-label={`Digit ${i + 1}`}
            className={cx('num h-14 w-full rounded-2xl border-2 bg-surface text-center text-2xl font-semibold outline-none transition sm:h-16', c ? 'border-brand-700' : 'border-line focus:border-brand-600')}
          />
        ))}
      </div>
      <Button className="mt-6 w-full" size="lg" loading={verifying} onClick={() => setCode('123456'.split(''))}>
        {verifying ? 'Verifying' : 'Autofill demo code'}
      </Button>
      <div className="mt-5 flex items-center justify-between text-sm">
        {onBack ? (
          <button onClick={onBack} className="font-medium text-muted hover:text-ink">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button disabled={resend > 0} onClick={() => setResend(30)} className="font-semibold text-brand-700 disabled:text-faint dark:text-brand-300">
          {resend > 0 ? `Resend in ${resend}s` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}
