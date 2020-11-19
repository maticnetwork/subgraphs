import { ExitStarted, ExitCancelled, ExitUpdated, Withdraw } from '../../generated/WithdrawManager/WithdrawManager'
import { PlasmaExitStarted, PlasmaExitCancelled, PlasmaExitUpdated, PlasmaExitCompleted } from '../../generated/schema'


export function handleExitStarted(event: ExitStarted): void {
  let entity = new PlasmaExitStarted("exitstarted:" + event.params.exitId)
  entity.exitor = event.params.exitor
  entity.exitId = event.params.exitId
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.isRegularExit = event.params.isRegularExit

  // save entity
  entity.save()
}

export function handleExitCancelled(event: ExitCancelled): void {
  let entity = new PlasmaExitCancelled("exitcancelled:" + event.params.exitId)
  entity.exitId = event.params.exitId

  entity.save()
}

export function handleExitUpdated(event: ExitUpdated): void {
  let entity = new PlasmaExitUpdated("exitupdated:" + event.params.exitId)
  entity.exitId = event.params.exitId
  entity.age = event.params.age
  entity.signer = event.params.signer

  entity.save()
}

export function handleWithdraw(event: Withdraw): void {
  let entity = new PlasmaExitUpdated("exitcompleted:" + event.params.exitId)
  entity.user = event.params.user
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.save()
}
