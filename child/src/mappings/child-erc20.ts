import { BigInt, Address } from '@graphprotocol/graph-ts'
import { LogTransfer, Withdraw, Transfer } from '../../generated/ChildERC20/ChildERC20'
import { TransactionEntity, GlobalTransferCounter } from '../../generated/schema'

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

// token, from, amount, to
export function handleLogTransfer(event: LogTransfer): void {
  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-logTransfer')
  transactionEntity.from = event.params.from
  transactionEntity.to = event.params.to
  transactionEntity.amount = event.params.amount
  transactionEntity.block = event.block.number
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.type = 'transfer'

  if (transactionEntity.to.toHex() === ZERO_ADDRESS) {
    return
  }
  transactionEntity.save()
}

export function handleWithdraw(event: Withdraw): void {

  // Try to get what's current globalcounter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalTransferCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()

  // Transaction Entity part
  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-withdraw')
  transactionEntity.from = event.params.from
  transactionEntity.to = Address.fromString(ZERO_ADDRESS)
  transactionEntity.amount = event.params.amount
  transactionEntity.block = event.block.number
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.type = 'withdraw'
  transactionEntity.tokenType = 'ERC20'
  transactionEntity.isPos = false
  transactionEntity.save()
}

export function handleTransfer(event: Transfer): void {
  // Try to get what's current global counter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalTransferCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()

  const isWithdraw = event.params.to.toHex() == ZERO_ADDRESS  ? true : false
  const isMint = event.params.from.toHex() == ZERO_ADDRESS  ? true : false

  let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + (isWithdraw ? '-withdraw' : isMint ? '-mint' : '-transfer'))
  transactionEntity.type = isWithdraw ? 'withdraw' : isMint ? 'mint' : 'transfer'
  transactionEntity.from = event.params.from
  transactionEntity.to = event.params.to
  transactionEntity.amount = event.params.value
  transactionEntity.block = event.block.number
  transactionEntity.timestamp = event.block.timestamp
  transactionEntity.transaction = event.transaction.hash
  transactionEntity.token = event.address
  transactionEntity.tokenType = 'ERC20'
  transactionEntity.isPos = true
  transactionEntity.save()
}
