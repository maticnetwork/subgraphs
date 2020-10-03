import { StateSynced, NewRegistration, RegistrationUpdated } from '../../generated/StateSender/StateSender'
import { StateRegistration, StateSync } from '../../generated/schema'

export function handleStateSynced(event: StateSynced): void {
  let entity = new StateSync(event.params.id.toString())
  entity.stateId = event.params.id
  entity.contract = event.params.contractAddress
  entity.data = event.params.data
  entity.timestamp = event.block.timestamp

  // save entity
  entity.save()
}

export function handleNewRegistration(event: NewRegistration): void {
  let id = "registration:" + event.params.receiver.toString()
  
  let entity = StateRegistration.load(id)
  if (entity == null) {
    entity = new StateRegistration(id)
  }
  entity.receiver = event.params.receiver
  entity.sender = event.params.sender
  entity.user = event.params.user

  // save entity
  entity.save()
}

export function handleRegistrationUpdated(event: RegistrationUpdated): void {
  let id = "registration:" + event.params.receiver.toString()
  
  let entity = StateRegistration.load(id)
  if (entity == null) {
    entity = new StateRegistration(id)
  }
  entity.receiver = event.params.receiver
  entity.sender = event.params.sender
  entity.user = event.params.user

  // save entity
  entity.save()
}
