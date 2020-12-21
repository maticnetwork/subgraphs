import { ExitStarted, ExitCancelled, Withdraw } from '../../generated/WithdrawManager/WithdrawManager'
import { PlasmaExit } from '../../generated/schema'


export function handleExitStarted(event: ExitStarted): void {
  let id = 'plasma-exit-' + event.params.exitId.toHexString()
  
  // this is first time this entity being created i.e. during plasma
  // exit start step
  let entity = new PlasmaExit(id)
  
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
