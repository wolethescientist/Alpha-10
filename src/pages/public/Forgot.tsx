import { KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Field, Input, Segmented, SuccessMark } from '../../components/ui'
import { AuthShell } from './AuthShell'
import { OtpStep } from './Login'

export default function Forgot() {
  const [what, setWhat] = useState<'password' | 'username'>('password')
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email')
  const [email, setEmail] = useState('chidinma.okafor@example.com')
  const [pw, setPw] = useState('')
  const strength = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        {step === 'email' && (
          <>
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-700/10 text-brand-700 dark:text-brand-300">
              <KeyRound className="size-7" />
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">Account recovery</h1>
            <p className="mt-2 text-muted">Recover your login details securely — no need to email customer service.</p>
            <Segmented className="mt-6" value={what} onChange={setWhat} options={[{ value: 'password', label: 'Reset password' }, { value: 'username', label: 'Find username' }]} />
            <Field label="Registered email" className="mt-6">
              <Input prefix={<Mail className="size-4" />} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button className="mt-6 w-full" size="lg" onClick={() => setStep(what === 'password' ? 'otp' : 'done')}>
              Continue
            </Button>
          </>
        )}
        {step === 'otp' && <OtpStep destination={email} onBack={() => setStep('email')} onDone={() => setStep('reset')} />}
        {step === 'reset' && (
          <>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Create a new password</h1>
            <Field label="New password" className="mt-6">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
            </Field>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: i < strength ? ['#d23c3c', '#e5a03a', '#c49a45', '#0f9d6b'][strength - 1] : 'var(--line)' }} />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</p>
            <Button className="mt-6 w-full" size="lg" disabled={strength < 3} onClick={() => setStep('done')}>
              Update password
            </Button>
          </>
        )}
        {step === 'done' && (
          <div className="flex flex-col items-center text-center">
            <SuccessMark />
            <h1 className="mt-6 font-display text-3xl font-semibold">{what === 'password' ? 'Password updated' : 'Check your inbox'}</h1>
            <p className="mt-2 text-muted">{what === 'password' ? 'You can now sign in with your new password.' : `We’ve sent your username to ${email}.`}</p>
            <Link to="/login" className="mt-8 w-full">
              <Button size="lg" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
