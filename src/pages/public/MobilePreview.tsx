import { motion } from 'framer-motion'
import { ArrowLeft, Smartphone } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { Logo } from '../../components/ui'
import { useApp } from '../../store/app'

export default function MobilePreview() {
  const session = useApp((s) => s.session)
  if (!session || session.role !== 'client') return <Navigate to="/login" replace />
  return (
    <div className="hero-gradient min-h-screen text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-10 lg:flex-row lg:justify-between lg:py-16">
        <div className="max-w-md">
          <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="size-4" /> Back to desktop
          </Link>
          <Logo variant="light" className="mt-8 h-10" />
          <h1 className="mt-8 font-display text-5xl leading-tight font-semibold">
            The same portal,
            <br />
            <span className="text-gold-300">in every pocket.</span>
          </h1>
          <p className="mt-5 text-white/65">
            Fully responsive and ready to ship as an iOS and Android app. This phone is the live portal — tap around, make a deposit, check the markets.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
            <Smartphone className="size-5 text-gold-400" /> Same account and data as the desktop view
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 40, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative">
          <div className="relative h-[780px] w-[380px] rounded-[3.2rem] bg-[#0a0a0a] p-3 shadow-[0_50px_120px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/15">
            <div className="flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-[#f7f5f2]">
              <div className="relative flex h-11 shrink-0 items-center justify-between px-7 text-[13px] font-semibold text-[#141414]">
                <span>9:41</span>
                <span className="absolute top-2.5 left-1/2 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
                <span className="tracking-tight">5G ▮▮▮</span>
              </div>
              <iframe title="Alpha10 mobile" src="/app" className="w-full flex-1 bg-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
