import { Address, BigInt } from '@graphprotocol/graph-ts'
import { NewHeaderBlock } from '../../generated/Rootchain/Rootchain'
import { Checkpoint } from '../../generated/schema'

import { decodeCheckpointSignerListAddress } from '../network'
import { DecodeCheckpointSignerList } from '../../generated/Rootchain/DecodeCheckpointSignerList'

let MAX_DEPOSITS = BigInt.fromI32(10000)

export function handleNewHeaderBlock(event: NewHeaderBlock): void {
  // checkpoint number is `header block / max_deposits`
  let checkpointNumber = event.params.headerBlockId.div(MAX_DEPOSITS)

  // use checkpoint number as id
  let entity = new Checkpoint('checkpoint:' + checkpointNumber.toString())
  entity.proposer = event.params.proposer
  entity.headerBlockId = event.params.headerBlockId
  entity.checkpointNumber = checkpointNumber
  entity.reward = event.params.reward
  entity.start = event.params.start
  entity.end = event.params.end
  entity.root = event.params.root

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp

  // Attempting to create an instance of `DecodeCheckpointSignerList` smart contract
  // to be used for figuring out who are those check point signers i.e. validators
  let decoder = DecodeCheckpointSignerList.bind(Address.fromString(decodeCheckpointSignerListAddress))

  // 👇 is being done because there's a possibly decoding might fail
  // if bad input is provided with
  //
  // @note This is nothing but a precautionary measurement
  let callResult = decoder.try_decode(event.transaction.input)

  // This condition will be true if during decoding
  // contract faces some issue
  //
  // If it does, only proposer address will be kept
  // in signer list, because we failed to extract out
  // all signer addresses
  //
  // @note Proposer itself is a signer.
  if (callResult.reverted) {

    let previousOwners = entity.signers
    previousOwners.push(event.params.proposer)
    entity.signers = previousOwners

    // save entity
    entity.save()

    return

  }

  // extracted out signer list stored in entity
  entity.signers = callResult.value.value0

  // save entity
  entity.save()
}
