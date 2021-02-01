import { Address } from '@graphprotocol/graph-ts'

import { StateSynced, NewRegistration, RegistrationUpdated } from '../../generated/StateSender/StateSender'
import { StateRegistration, StateSync } from '../../generated/schema'

import { decoderAddress } from '../network'
import { Decoder } from '../../generated/StateSender/Decoder'

export function handleStateSynced(event: StateSynced): void {
  let entity = new StateSync('statesync:' + event.params.id.toString())
  entity.stateId = event.params.id
  entity.contract = event.params.contractAddress

  let decoder = Decoder.bind(Address.fromString(decoderAddress))
  let callResult = decoder.try_decodeStateSyncData(event.params.data)

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp

  if (callResult.reverted) {

    entity.syncType = ""
    entity.depositor_or_rootToken = ""
    entity.depositedToken_or_childToken = ""
    entity.data = event.params.data

    return

  }

  entity.syncType = decoded.value0
  entity.depositor_or_rootToken = decoded.value1
  entity.depositedToken_or_childToken = decoded.value2
  entity.data = decoded.value3

  // save entity
  entity.save()
}

export function handleNewRegistration(event: NewRegistration): void {
  let id = 'registration:' + event.params.receiver.toHexString()

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
  let id = 'registration:' + event.params.receiver.toHexString()

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
