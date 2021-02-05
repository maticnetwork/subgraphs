import { Address, BigDecimal, BigInt, Value } from '@graphprotocol/graph-ts'
import { NewHeaderBlock } from '../../generated/Rootchain/Rootchain'
import { Checkpoint, Validator } from '../../generated/schema'

import { decodeCheckpointSignerListAddress, stakeManager } from '../network'
import { DecodeCheckpointSignerList } from '../../generated/Rootchain/DecodeCheckpointSignerList'
import { StakeManager } from '../../generated/Rootchain/StakeManager'

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

  let signers = Value.fromAddressArray(callResult.value as Array<Address>).toBytesArray()

  // Validators who signed this checkpoint
  entity.signers = signers

  // Stake manager contract instance to be used for queried
  // validator id given their address i.e. signer address
  let stakeManagerInstance = StakeManager.bind(Address.fromString(stakeManager))
  // Also reading total staked value of network, to be used
  // for calculating validator power
  let totalStaked = new BigDecimal(stakeManagerInstance.totalStaked())

  let powers: BigDecimal[] = []

  for (let i = 0; i < signers.length; i++) {

    // Attempting to find out what's validatorId, given their signer address
    let validatorId = stakeManagerInstance.signerToValidator(Address.fromString(signers[i].toString()))

    // Attempting to find validator by id
    let validator = Validator.load('validator:' + validatorId.toString())
    if (validator == null) {
      powers.push(BigDecimal.fromString('0.0'))
      continue
    }

    let selfStake = new BigDecimal(validator.selfStake)
    let delegatedStake = new BigDecimal(validator.delegatedStake)

    // Calculating power of this validator at this checkpoint
    powers.push(selfStake.plus(delegatedStake).div(totalStaked))

  }

  let rewards: BigDecimal[] = []

  for (let i = 0; i < signers.length; i++) {


    // Attempting to find out what's validatorId, given their signer address
    let validatorId = stakeManagerInstance.signerToValidator(Address.fromString(signers[i].toString()))

    // Attempting to find validator by id
    let validator = Validator.load('validator:' + validatorId.toString())
    if (validator == null) {
      rewards.push(BigDecimal.fromString('0.0'))
      continue
    }

    let selfStake = new BigDecimal(validator.selfStake)
    let delegatedStake = new BigDecimal(validator.delegatedStake)

    // Calculating how much has validator stake on self divided by
    // total staked on self
    let selfBondRatio = selfStake.div(delegatedStake.plus(selfStake))
    // How much delegators has staked, in ratio form
    let one = BigDecimal.fromString('1.0')
    let delegatedBondRatio = one.minus(selfBondRatio)

    let reward = new BigDecimal(event.params.reward)
    let commissionRate = new BigDecimal(validator.commissionRate)

    // Calculating reward obtained by this validator
    // for signing this checkpoint
    //
    // 👇 check-point-reward * validator-power * ( self-bond-ratio + ( commission-rate * delegated-bond-ratio ) / 100)
    rewards.push(reward
      .times(powers[i])
      .times(selfBondRatio
        .plus(commissionRate
          .div(BigDecimal.fromString('100.0')
            .times(delegatedBondRatio)))))


  }

  entity.powers = powers
  entity.rewards = rewards


  // save entity
  entity.save()
}
