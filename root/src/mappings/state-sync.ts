import { Address } from '@graphprotocol/graph-ts'

import { StateSynced, NewRegistration, RegistrationUpdated } from '../../generated/StateSender/StateSender'
import { StateRegistration, StateSync } from '../../generated/schema'

import { decoderAddress } from '../network'
import { Decoder } from '../../generated/StateSender/Decoder'

export function handleStateSynced(event: StateSynced): void {
  let entity = new StateSync('statesync:' + event.params.id.toString())
  entity.stateId = event.params.id
  entity.contract = event.params.contractAddress

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp

  // Attempting to create an instance of `Decoder` smart contract
  // to be used for decoding valid state sync data
  let decoder = Decoder.bind(Address.fromString(decoderAddress))
  // 👇 is being done because there's a possibly decoding might fail
  // if bad input is provided with
  let callResult = decoder.try_decodeStateSyncData(event.params.data)

  // this condition will be true if during decoding
  // decoder contract faces some issue
  //
  // consumer can safely ignore this state sync
  // if they see, `syncType` = -1, because it has
  // undecodable data
  //
  // but it interested client can always find out what data
  // is by reading `data` field, where it is encoded form
  if (callResult.reverted) {

    entity.syncType = -1
    entity.depositorOrRootToken = '0x'
    entity.depositedTokenOrChildToken = '0x'
    entity.data = event.params.data

    // save entity
    entity.save()

    return

  }

  // Attempting to read decoded data, so that
  // it can be stored in this entity
  let decoded = callResult.value

  entity.syncType = decoded.value0
  entity.depositorOrRootToken = decoded.value1.toHex()
  entity.depositedTokenOrChildToken = decoded.value2.toHex()
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
