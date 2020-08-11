import { Transfer } from '../generated/ChildERC20/childERC20LogTransferABI'
import { TransferEntity } from '../generated/schema'
import { toDecimal } from '../helpers/numbers'

// token, from, amount, to
export function handleTransfer(event: Transfer): void {
    let transferEntity = new TransferEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
    transferEntity.from = event.params.from
    transferEntity.to = event.params.to 
    transferEntity.value = toDecimal(event.params.value, 18) 
    transferEntity.save()
}
