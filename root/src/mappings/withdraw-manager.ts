import { BigInt } from '@graphprotocol/graph-ts'
import { ExitStarted, ExitCancelled, Withdraw } from '../../generated/WithdrawManager/WithdrawManager'
import { PlasmaExit, GlobalPlasmaExitCounter } from '../../generated/schema'

function getGlobalPlasmaExitCounter(): GlobalPlasmaExitCounter {
  // Only one entry will be kept in this entity
  let id = 'global-plasma-exit-counter'
  let entity = GlobalPlasmaExitCounter.load(id)
  if (entity == null) {

    entity = new GlobalPlasmaExitCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as GlobalPlasmaExitCounter
}

export function handleExitStarted(event: ExitStarted): void {
  let id = 'plasma-exit-' + event.params.exitId.toHexString()

  // Try to get what's current global plasma counter's state
  // when called for very first time, it'll be `0`
  let counter = getGlobalPlasmaExitCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  // Updating global counter's state
  counter.current = updated
  counter.save()
  
  // this is first time this entity being created i.e. during plasma
  // exit start step
  let entity = new PlasmaExit(id)
  entity.counter = updated
  entity.exitId = event.params.exitId
  entity.exitInitiator = event.params.exitor
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.isRegularExit = event.params.isRegularExit
  // exit started state => 0
  entity.exited = 0
  entity.exitStartedTxHash = event.transaction.hash
  entity.exitStartedTimeStamp = event.block.timestamp

  // save entity
  entity.save()
}

export function handleExitCancelled(event: ExitCancelled): void {
  let id = 'plasma-exit-' + event.params.exitId.toHexString()
  
  let entity = PlasmaExit.load(id)
  if (entity == null) {
    entity = new PlasmaExit(id)

    entity.counter = BigInt.fromI32(0)
    entity.isRegularExit = true
    entity.exited = 1
  }

  entity.exitId = event.params.exitId

  // exit cancelled state => 1
  if (entity.exited < 1) {
    entity.exited = 1
  }

  entity.exitCancelledTxHash = event.transaction.hash
  entity.exitCancelledTimeStamp = event.block.timestamp

  entity.save()
}


export function handleWithdraw(event: Withdraw): void {
  let id = 'plasma-exit-' + event.params.exitId.toHexString()
  
  let entity = PlasmaExit.load(id)
  if (entity == null) {
    entity = new PlasmaExit(id)

    entity.counter = BigInt.fromI32(0)
    entity.isRegularExit = true
    entity.exited = 2
  }

  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.exitId = event.params.exitId
  
  entity.exitCompleter = event.params.user
  // exit completed state => 2
  if(entity.exited < 2) {
    entity.exited = 2
  }

  entity.exitCompletedTxHash = event.transaction.hash
  entity.exitCompletedTimeStamp = event.block.timestamp

  entity.save()
}
