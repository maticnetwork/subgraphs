import { BigInt } from '@graphprotocol/graph-ts'
import { TransferBatch, TransferSingle } from '../../generated/ChildERC1155/ChildERC1155'
import { TransactionEntity, GlobalTransferCounter } from '../../generated/schema'
//import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

export function handleSingleTransfer(event: TransferSingle): void {

  // Try to get what's current global counter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalTransferCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()

  const isWithdraw = event.params.to.toHex() == ZERO_ADDRESS ? true : false
  const isMint = event.params.from.toHex() == ZERO_ADDRESS ? true : false

  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + (isWithdraw ? '-burn' : isMint ? '-mint' :  '-transfer'))
  transactionEntity.type = isWithdraw ? 'burn' : isMint ? 'mint' : 'transfer'
  transactionEntity.from = event.params.from
  transactionEntity.to = event.params.to
  transactionEntity.amount = event.params.value
  transactionEntity.tokenId = event.params.id
  transactionEntity.block = event.block.number
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.tokenType = 'ERC1155'
  transactionEntity.isPos = true
  transactionEntity.save()
}

export function handleBatchTransfer(event: TransferBatch): void {
  // Try to get what's current global counter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalTransferCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()

  const isWithdraw = event.params.to.toHex() == ZERO_ADDRESS ? true : false
  const isMint = event.params.from.toHex() == ZERO_ADDRESS ? true : false

  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + (isWithdraw ? '-burn' : isMint ? '-mint' : '-transfer'))

  transactionEntity.type = isWithdraw ? 'burn' : isMint ? 'mint' : 'transfer'
  transactionEntity.from = event.params.from
  transactionEntity.to = event.params.to
  transactionEntity.amounts = event.params.values
  transactionEntity.tokenIds = event.params.ids
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.tokenType = 'ERC1155'
  transactionEntity.isPos = true
  transactionEntity.save()
}
