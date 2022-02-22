import { BigInt } from '@graphprotocol/graph-ts'
import { Transfer } from '../../generated/ChildERC721/ChildERC721'
import { TransactionEntity, GlobalTransferCounter } from '../../generated/schema'
//import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// export function handleWithdraw(event: Withdraw): void {
//   let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-withdraw')

//   transactionEntity.from = event.params.from
//   transactionEntity.to = null
//   transactionEntity.value = event.params.tokenId
//   transactionEntity.block = event.block.number
//   transactionEntity.timestamp = event.block.timestamp
//   transactionEntity.transaction = event.transaction.hash
//   transactionEntity.token = event.address
//   transactionEntity.type = 'withdraw'
//   transactionEntity.isPos = false
//   transactionEntity.save()
// }

function getGlobalTransferCounter(): GlobalTransferCounter {
  // Only one entry will be kept in this entity
  let id = 'global-transfer-counter'
  let entity = GlobalTransferCounter.load(id)
  if (entity === null) {
    entity = new GlobalTransferCounter(id)
    entity.current = BigInt.fromI32(0)
  }
  return entity as GlobalTransferCounter
}

export function handleTransfer(event: Transfer): void {

  // Try to get what's current global counter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalTransferCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()

  const isWithdraw = event.params.to.toHex() === ZERO_ADDRESS || event.params.to === event.address ? true : false

  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + (isWithdraw  ? '-withdraw' : '-transfer'))
  transactionEntity.type = isWithdraw  ? 'withdraw' : 'transfer'
  transactionEntity.from = event.params.from
  transactionEntity.to = event.params.to
  transactionEntity.tokenId = event.params.tokenId
  transactionEntity.block = event.block.number
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.tokenType = 'ERC721'
  transactionEntity.isPos = true
  transactionEntity.save()
}
