import { jsPDF } from 'jspdf'
import { date, money } from './format'
import { accrued, holdingValue, maturityDate, productMap } from './products'
import type { ClientAccount, Holding, Txn } from './types'

const CRIMSON: [number, number, number] = [150, 26, 28]
const INK: [number, number, number] = [20, 20, 20]
const MUTED: [number, number, number] = [110, 104, 98]

async function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// jsPDF's core fonts have no ₦ glyph, so currency is written with its ISO code in PDFs.
const pdfMoney = (v: number, c: 'NGN' | 'USD') => money(v, c).replace('₦', 'NGN ').replace('$', 'USD ').replace('−', '-')

export async function certificatePdf(acc: ClientAccount, h: Holding) {
  const p = productMap[h.productId]
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  doc.setFillColor(252, 250, 246)
  doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(...CRIMSON)
  doc.setLineWidth(3)
  doc.rect(24, 24, W - 48, H - 48)
  doc.setDrawColor(196, 154, 69)
  doc.setLineWidth(0.8)
  doc.rect(34, 34, W - 68, H - 68)

  const logo = await loadImage('/logo-dark.png')
  if (logo) doc.addImage(logo, 'PNG', W / 2 - 90, 58, 180, 57)

  doc.setFont('times', 'normal')
  doc.setTextColor(...MUTED)
  doc.setFontSize(11)
  doc.text('ALPHA10 FUND MANAGEMENT LIMITED', W / 2, 140, { align: 'center', charSpace: 2 })
  doc.setFont('times', 'bold')
  doc.setTextColor(...CRIMSON)
  doc.setFontSize(34)
  doc.text('Certificate of Investment', W / 2, 184, { align: 'center' })
  doc.setFont('times', 'italic')
  doc.setTextColor(...MUTED)
  doc.setFontSize(13)
  doc.text('This is to certify that', W / 2, 218, { align: 'center' })
  doc.setFont('times', 'bold')
  doc.setTextColor(...INK)
  doc.setFontSize(26)
  doc.text(acc.profile.companyName ?? `${acc.profile.firstName} ${acc.profile.lastName}`, W / 2, 254, { align: 'center' })
  doc.setFont('times', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...MUTED)
  doc.text(`holds an investment in the ${p.name} as detailed below.`, W / 2, 280, { align: 'center' })

  const rows: [string, string][] = [
    ['Certificate No.', `A10-CERT-${h.id.slice(2).toUpperCase()}`],
    ['Account No.', acc.profile.accountNo],
    ['Principal', pdfMoney(h.principal, p.currency)],
    ['Current value', pdfMoney(holdingValue(h), p.currency)],
    ['Rate', `${h.rate.toFixed(2)}% per annum`],
    ['Effective date', date(h.startDate, 'long')],
    ['Maturity', maturityDate(h) ? date(maturityDate(h)!, 'long') : 'Open-ended'],
    ['Issued', date(new Date().toISOString(), 'long')],
  ]
  const colX = [W / 2 - 250, W / 2 + 20]
  rows.forEach(([k, v], i) => {
    const x = colX[i % 2]!
    const y = 320 + Math.floor(i / 2) * 34
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(k.toUpperCase(), x, y)
    doc.setFontSize(13)
    doc.setTextColor(...INK)
    doc.text(v, x, y + 15)
  })

  // seal
  doc.setFillColor(...CRIMSON)
  doc.circle(W - 140, H - 120, 42, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(1)
  doc.circle(W - 140, H - 120, 35)
  doc.setTextColor(255, 255, 255)
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text('ALPHA10', W - 140, H - 123, { align: 'center' })
  doc.setFontSize(7)
  doc.text('SEC REGULATED', W - 140, H - 111, { align: 'center' })

  doc.setDrawColor(...INK)
  doc.setLineWidth(0.6)
  doc.line(90, H - 100, 270, H - 100)
  doc.setFont('times', 'italic')
  doc.setFontSize(18)
  doc.setTextColor(...INK)
  doc.text('Alpha10 FM', 120, H - 108)
  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Authorised signatory', 90, H - 86)
  doc.setFontSize(8)
  doc.text(`Verify at alpha10group.com/verify · ${p.trustee ? `Trustee: ${p.trustee} · ` : ''}Prototype document — not a real certificate`, W / 2, H - 46, { align: 'center' })
  doc.save(`Alpha10-Certificate-${p.short.replace(/\s/g, '')}.pdf`)
}

export async function statementPdf(acc: ClientAccount, txns: Txn[], from: Date, to: Date, fx: number) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  doc.setFillColor(...CRIMSON)
  doc.rect(0, 0, W, 96, 'F')
  const logo = await loadImage('/logo-light.png')
  if (logo) doc.addImage(logo, 'PNG', 40, 26, 140, 44)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Statement of Account', W - 40, 46, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${date(from.toISOString(), 'long')} – ${date(to.toISOString(), 'long')}`, W - 40, 62, { align: 'right' })

  doc.setTextColor(...INK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(acc.profile.companyName ?? `${acc.profile.firstName} ${acc.profile.lastName}`, 40, 130)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text([acc.profile.address, `${acc.profile.city}, ${acc.profile.state}`, `Account: ${acc.profile.accountNo}`], 40, 146)

  let y = 200
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Portfolio summary', 40, y)
  y += 16
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  ;['Product', 'Principal', 'Interest', 'Value'].forEach((h, i) => doc.text(h, [40, 300, 400, W - 40][i]!, y, { align: i === 3 ? 'right' : 'left' }))
  y += 6
  doc.setDrawColor(230, 225, 220)
  doc.line(40, y, W - 40, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  let totalNGN = 0
  for (const h of acc.holdings) {
    const p = productMap[h.productId]
    y += 16
    doc.text(p.name, 40, y)
    doc.text(pdfMoney(h.principal, p.currency), 300, y)
    doc.text(pdfMoney(accrued(h), p.currency), 400, y)
    doc.text(pdfMoney(holdingValue(h), p.currency), W - 40, y, { align: 'right' })
    totalNGN += holdingValue(h) * (p.currency === 'USD' ? fx : 1)
  }
  y += 20
  doc.setFont('helvetica', 'bold')
  doc.text(`Total (NGN equivalent @ ${fx.toFixed(2)})`, 40, y)
  doc.text(pdfMoney(totalNGN + acc.wallet.NGN + acc.wallet.USD * fx, 'NGN'), W - 40, y, { align: 'right' })

  y += 40
  doc.setFontSize(11)
  doc.text('Transactions', 40, y)
  y += 16
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  ;['Date', 'Reference', 'Description', 'Amount'].forEach((h, i) => doc.text(h, [40, 110, 210, W - 40][i]!, y, { align: i === 3 ? 'right' : 'left' }))
  y += 6
  doc.line(40, y, W - 40, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...INK)
  for (const t of txns) {
    y += 15
    if (y > H - 60) {
      doc.addPage()
      y = 60
    }
    doc.setFontSize(8)
    doc.text(date(t.date), 40, y)
    doc.text(t.reference, 110, y)
    doc.text(t.description.slice(0, 48), 210, y)
    const sign = ['withdrawal', 'charge'].includes(t.type) ? '-' : ''
    doc.text(sign + pdfMoney(t.amount, t.currency), W - 40, y, { align: 'right' })
  }
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Alpha10 Fund Management Limited is registered and regulated by the Securities and Exchange Commission, Nigeria. Prototype document — simulated data.', W / 2, H - 30, { align: 'center' })
  doc.save(`Alpha10-Statement-${to.toISOString().slice(0, 7)}.pdf`)
}
