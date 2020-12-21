import { Address, BigInt } from '@graphprotocol/graph-ts'
import { 
  Delegator, 
  Validator, 
  Topup, 
  StakingParams, 
} from '../../generated/schema'
import {
  ClaimFee,
  ClaimRewards,
  DelegatorClaimedRewards,
  DelegatorUnstaked,
  DynastyValueChange,
  Jailed,
  OwnershipTransferred,
  ProposerBonusChange,
  Restaked,
  ShareBurned,
  ShareMinted,
  SignerChange,
  StakeUpdate,
  Staked,
  ThresholdChange,
  TopUpFee,
  UnJailed,
  UnstakeInit,
  Unstaked,
  UpdateCommissionRate,
} from '../../generated/StakingInfo/StakingInfo'

const STAKING_PARAMS_ID = `staking:params`

export function handleStaked(event: Staked): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = new Validator(id)

  entity.validatorId = event.params.validatorId
  entity.signer = event.params.signer
  entity.activationEpoch = event.params.activationEpoch
  entity.amount = event.params.amount
  entity.total = event.params.total
  entity.signerPubKey = event.params.signerPubkey

  // save entity
  entity.save()
}

export function handleUnstaked(event: Unstaked): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.signer = event.params.user
  entity.amount = event.params.amount
  entity.total = event.params.total

  // save entity
  entity.save()
}

export function handleUnstakeInit(event: UnstakeInit): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.signer = event.params.user
  entity.deactivationEpoch = event.params.deactivationEpoch
  entity.amount = event.params.amount

  // save entity
  entity.save()
}

export function handleSignerChange(event: SignerChange): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.signer = event.params.newSigner
  entity.signerPubKey = event.params.signerPubkey

  // save entity
  entity.save()
}

export function handleRestaked(event: Restaked): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.amount = event.params.amount
  entity.total = event.params.total

  // save entity
  entity.save()
}

export function handleJailed(event: Jailed): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  // save entity with jail end epoch
  entity.jailEndEpoch = event.params.exitEpoch
  entity.save()
}

export function handleUnJailed(event: UnJailed): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  // save entity
  entity.save()
}

export function handleStakeUpdate(event: StakeUpdate): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.amount = event.params.newAmount

  // save entity
  entity.save()
}

export function handleClaimRewards(event: ClaimRewards): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.amount = event.params.amount
  entity.total = event.params.totalAmount

  // save entity
  entity.save()
}

export function handleShareMinted(event: ShareMinted): void {
  const id = `delegator:${event.params.validatorId.toString()}:${event.params.user.toHexString()}`

  let entity = Delegator.load(id)
  if (entity == null) {
    entity = new Delegator(id)
  }

  entity.validatorId = event.params.validatorId
  entity.address = event.params.user
  entity.amount = entity.amount.plus(event.params.amount)
  entity.tokens = event.params.tokens

  // save entity
  entity.save()
}

export function handleShareBurned(event: ShareBurned): void {
  const id = `delegator:${event.params.validatorId.toString()}:${event.params.user.toHexString()}`

  let entity = Delegator.load(id)
  if (entity == null) {
    entity = new Delegator(id)
  }

  entity.amount = entity.amount.minus(event.params.amount)
  entity.tokens = event.params.tokens

  // save entity
  entity.save()
}

export function handleDelegatorUnstaked(event: DelegatorUnstaked): void {
  const id = `delegator:${event.params.validatorId.toString()}:${event.params.user.toHexString()}`

  let entity = Delegator.load(id)
  if (entity == null) {
    entity = new Delegator(id)
  }

  // save entity
  entity.amount = entity.amount.minus(event.params.amount)
  entity.save()
}

export function handleDelegatorClaimedRewards(event: DelegatorClaimedRewards): void {
  const id = `delegator:${event.params.validatorId.toString()}:${event.params.user.toHexString()}`

  let entity = Delegator.load(id)
  if (entity == null) {
    entity = new Delegator(id)
  }

  // update total claimed rewards by adding claimed rewards
  entity.claimedRewards = entity.claimedRewards.plus(event.params.rewards)
  entity.save()
}

export function handleUpdateCommissionRate(event: UpdateCommissionRate): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  // save validator entity with new commission rate
  entity.commissionRate = event.params.newCommissionRate
  entity.save()
}

//
// Topup
//

function loadTopupAccount(user: Address): Topup {
  const id = `topup:${user.toHexString()}`

  let entity = Topup.load(id)
  if (entity == null) {
    entity = new Topup(id)
    entity.address = user // set user
    entity.topupAmount = BigInt.fromI32(0) // initialize topup amount
    entity.withdrawAmount = BigInt.fromI32(0) // initialize topup amount
  }

  return entity as Topup
}

export function handleClaimFee(event: ClaimFee): void {
  let entity = loadTopupAccount(event.params.user)

  // save entity with topup amount
  entity.topupAmount = entity.topupAmount.plus(event.params.fee)
  entity.save()
}

export function handleTopUpFee(event: TopUpFee): void {
  let entity = loadTopupAccount(event.params.user)

  // save entity with withdraw amount
  entity.withdrawAmount = entity.withdrawAmount.plus(event.params.fee)
  entity.save()
}

//
// Staking params handlers
//

function loadStakingParams(): StakingParams {
  let entity = StakingParams.load(STAKING_PARAMS_ID)
  if (entity == null) {
    entity = new StakingParams(STAKING_PARAMS_ID)
  }

  return entity as StakingParams
}

export function handleDynastyValueChange(event: DynastyValueChange): void {
  let entity = loadStakingParams()

  // save entity with dynasty
  entity.dynasty = event.params.newDynasty
  entity.save()
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let entity = loadStakingParams()

  // save entity with owner
  entity.owner = event.params.newOwner
  entity.save()
}

export function handleProposerBonusChange(event: ProposerBonusChange): void {
  let entity = loadStakingParams()

  // save entity with proposer bonus
  entity.proposerBonus = event.params.newProposerBonus
  entity.save()
}

export function handleThresholdChange(event: ThresholdChange): void {
  let entity = loadStakingParams()

  // save entity with validator threshold
  entity.validatorThreshold = event.params.newThreshold
  entity.save()
}
