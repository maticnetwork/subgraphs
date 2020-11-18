import { ExitStarted, ExitCancelled } from '../../generated/WithdrawManager/WithdrawManager'
import { PlasmaExitStarted, PlasmaExitCancelled } from '../../generated/schema'


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
  entity.exitId = event.param.exitId

  entity.save()
}
