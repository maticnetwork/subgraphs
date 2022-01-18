import { Transfer } from '../../generated/TestToken/TestToken'
import { MaticTransfer } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {  
  let entity = new MaticTransfer(event.transaction.hash.toHex() + '-' + event.logIndex.toString())

  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value
  entity.block = event.block.number
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.token = event.address

  entity.save()
}
