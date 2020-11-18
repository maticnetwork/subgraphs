import { ExitStarted } from '../../generated/WithdrawManager/WithdrawManager'
import { PlasmaExitStarted } from '../../generated/schema'


export function handleExitStarted(event: ExitStarted): void {
  // use checkpoint number as id
  let entity = new PlasmaExitStarted("exitstarted:" + event.params.exitId)
  entity.exitor = event.params.exitor
  entity.exitId = event.params.exitId
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.isRegularExit = event.params.isRegularExit

  // save entity
  entity.save()
}
