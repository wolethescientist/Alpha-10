import { useUI } from '../../store/ui'
import { Modal } from '../ui'
import { DepositFlow } from './DepositFlow'
import { InvestFlow } from './InvestFlow'
import { RedeemFlow } from './RedeemFlow'
import { SwitchFlow } from './SwitchFlow'
import { WithdrawFlow } from './WithdrawFlow'

const TITLES = { deposit: 'Add money', invest: 'Invest', redeem: 'Redeem investment', switch: 'Switch plan', withdraw: 'Withdraw to bank' }

export function Flows() {
  const flow = useUI((s) => s.flow)
  const close = useUI((s) => s.close)
  // key forces each newly-opened flow to start from a clean state
  const key = flow ? JSON.stringify(flow) : 'none'
  return (
    <Modal open={!!flow} onClose={close} title={flow ? TITLES[flow.kind] : ''}>
      {flow?.kind === 'deposit' && <DepositFlow key={key} initialCurrency={flow.currency} onClose={close} />}
      {flow?.kind === 'invest' && <InvestFlow key={key} initialProduct={flow.productId} goalId={flow.goalId} onClose={close} />}
      {flow?.kind === 'redeem' && <RedeemFlow key={key} holdingId={flow.holdingId} onClose={close} />}
      {flow?.kind === 'switch' && <SwitchFlow key={key} holdingId={flow.holdingId} onClose={close} />}
      {flow?.kind === 'withdraw' && <WithdrawFlow key={key} onClose={close} />}
    </Modal>
  )
}
