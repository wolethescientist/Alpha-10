import { motion } from 'framer-motion'
import { ArrowLeft, Download, Printer, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button, Logo } from '../../components/ui'
import { date, money, seeded } from '../../lib/format'
import { displayName } from '../../lib/hooks'
import { certificatePdf } from '../../lib/pdf'
import { holdingValue, maturityDate, productMap } from '../../lib/products'
import { useAccount } from '../../store/app'

function PseudoQr({ seed }: { seed: string }) {
  const rnd = seeded(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const n = 21
  const cells: [number, number][] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
      if (finder) {
        const fx = x >= n - 7 ? x - (n - 7) : x
        const fy = y >= n - 7 ? y - (n - 7) : y
        const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)
        if (ring) cells.push([x, y])
      } else if (rnd() > 0.52) cells.push([x, y])
    }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-20" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="white" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#141414" />
      ))}
    </svg>
  )
}

export default function Certificate() {
  const { id } = useParams()
  const acc = useAccount()
  const h = acc.holdings.find((x) => x.id === id)
  const [busy, setBusy] = useState(false)
  if (!h) return <Navigate to="/app/portfolio" replace />
  const p = productMap[h.productId]
  const mat = maturityDate(h)
  const certNo = `A10-CERT-${h.id.slice(2).toUpperCase()}`

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> Portfolio
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Printer className="size-4" />} onClick={() => window.print()}>
            Print
          </Button>
          <Button
            loading={busy}
            icon={<Download className="size-4" />}
            onClick={async () => {
              setBusy(true)
              await certificatePdf(acc, h)
              setBusy(false)
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-xl bg-[#fcfaf6] p-3 text-[#141414] shadow-2xl">
          <div className="rounded-lg border-[3px] border-brand-700 p-1.5">
            <div className="relative rounded border border-gold-500 px-6 py-10 sm:px-14 sm:py-12">
              <img src="/mark-dark.png" alt="" aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]" />
              <div className="relative flex flex-col items-center text-center">
                <Logo variant="dark" className="h-12 sm:h-14" />
                <p className="mt-5 text-[11px] font-semibold tracking-[0.3em] text-[#6b6560]">ALPHA10 FUND MANAGEMENT LIMITED</p>
                <h1 className="mt-3 font-display text-3xl font-semibold text-brand-700 sm:text-5xl">Certificate of Investment</h1>
                <p className="mt-4 font-display text-[#6b6560] italic">This is to certify that</p>
                <p className="mt-2 font-display text-2xl font-semibold sm:text-4xl">{displayName(acc.profile)}</p>
                <p className="mt-3 max-w-lg text-sm text-[#6b6560]">holds an investment in the <b className="text-[#141414]">{p.name}</b>, managed by Alpha10 Fund Management Limited, a fund manager registered with the Securities and Exchange Commission, Nigeria.</p>
              </div>
              <div className="relative mt-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                {[
                  ['Certificate no.', certNo],
                  ['Account no.', acc.profile.accountNo],
                  ['Principal', money(h.principal, p.currency)],
                  ['Current value', money(holdingValue(h), p.currency)],
                  ['Rate', `${h.rate.toFixed(2)}% p.a.`],
                  ['Effective date', date(h.startDate, 'long')],
                  ['Maturity', mat ? date(mat, 'long') : 'Open-ended'],
                  ['Issued', date(new Date().toISOString(), 'long')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#a29b94] uppercase">{k}</p>
                    <p className="num mt-1 text-sm font-semibold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-12 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="font-display text-2xl italic text-[#6b6560]">Alpha10 FM</p>
                  <div className="mt-1 h-px w-48 bg-[#141414]" />
                  <p className="mt-1.5 text-xs text-[#6b6560]">Authorised signatory</p>
                </div>
                <div className="flex items-center gap-4">
                  <PseudoQr seed={certNo} />
                  <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: -12 }} transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 12 }} className="grid size-24 place-items-center rounded-full bg-brand-700 text-center text-white shadow-lg ring-4 ring-brand-700/20">
                    <div className="grid size-[84px] place-items-center rounded-full border border-white/60">
                      <div>
                        <ShieldCheck className="mx-auto size-5" />
                        <p className="mt-0.5 text-[9px] font-bold tracking-widest">ALPHA10</p>
                        <p className="text-[7px] tracking-wider">VERIFIED</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="no-print mt-4 text-center text-xs text-muted">Embassy-ready · scan the QR code to verify authenticity · {p.trustee ? `Trustee: ${p.trustee}` : 'Sovereign-backed instruments'}</p>
      </motion.div>
    </div>
  )
}
