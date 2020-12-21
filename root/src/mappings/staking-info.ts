import { Delegator, Validator, StakingParams } from '../../generated/schema'
import {
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
  UnJailed,
  UnstakeInit,
  Unstaked,
  UpdateCommissionRate,
} from '../../generated/StakingInfo/StakingInfo'

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
  entity.amount = entity.amount + event.params.amount
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

  entity.amount = entity.amount - event.params.amount
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

  entity.amount = entity.amount - event.params.amount

  // save entity
  entity.save()
}

export function handleDelegatorClaimedRewards(
  event: DelegatorClaimedRewards
): void {
  const id = `delegator:${event.params.validatorId.toString()}:${event.params.user.toHexString()}`

  let entity = Delegator.load(id)
  if (entity == null) {
    entity = new Delegator(id)
  }

  entity.claimedRewards = entity.claimedRewards + event.params.rewards

  // save entity
  entity.save()
}

export function handleUpdateCommissionRate(event: UpdateCommissionRate): void {
  const id = `validator:${event.params.validatorId.toString()}`

  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
  }

  entity.commissionRate = event.params.newCommissionRate

  // save entity
  entity.save()
}

//
// Staking params handlers
//

export function handleDynastyValueChange(event: DynastyValueChange): void {
  const id = `staking:params`
  
  let entity = StakingParams.load(id)
  if (entity == null) {
    entity = new StakingParams(id)
  }

  // save entity with dynasty
  entity.dynasty = event.params.newDynasty
  entity.save()
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const id = `staking:params`
  
  let entity = StakingParams.load(id)
  if (entity == null) {
    entity = new StakingParams(id)
  }

  // save entity with owner
  entity.owner = event.params.newOwner
  entity.save()
}

export function handleProposerBonusChange(event: ProposerBonusChange): void {
  const id = `staking:params`
  
  let entity = StakingParams.load(id)
  if (entity == null) {
    entity = new StakingParams(id)
  }

  // save entity with proposer bonus
  entity.proposerBonus = event.params.newProposerBonus
  entity.save()
}

export function handleThresholdChange(event: ThresholdChange): void {
  const id = `staking:params`
  
  let entity = StakingParams.load(id)
  if (entity == null) {
    entity = new StakingParams(id)
  }

  // save entity with validator threshold
  entity.validatorThreshold = event.params.newThreshold
  entity.save()
}
