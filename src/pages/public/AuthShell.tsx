import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/ui'

export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1fr_1.05fr]">
      <div className="hero-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <img src="/mark-light.png" alt="" aria-hidden className="pointer-events-none absolute -right-40 -bottom-40 w-[640px] animate-float opacity-[0.08]" />
        <Link to="/">
          <Logo variant="light" className="h-11" />
        </Link>
        <div className="relative mt-auto">
          {aside ?? (
            <>
              <p className="font-display text-5xl leading-tight font-semibold">
                Wealth, managed
                <br />
                <span className="text-gold-300 italic">beautifully.</span>
              </p>
              <p className="mt-5 max-w-md text-white/65">Professionalism, Innovation, Listening, Accountability, Trust and Equity — the PILATE values behind every naira we manage.</p>
            </>
          )}
        </div>
        <p className="relative mt-12 text-xs text-white/40">SEC-regulated · BBB+ (Datapro) · Prototype with simulated data</p>
      </div>
      <div className="flex flex-col">
        <div className="flex h-20 items-center justify-between px-6 lg:hidden">
          <Link to="/">
            <Logo className="h-9" />
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          {children}
        </motion.div>
      </div>
    </div>
  )
}
