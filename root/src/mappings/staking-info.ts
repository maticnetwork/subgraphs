import { 
  Staked, Unstaked, UnstakeInit, 
  SignerChange, Restaked, Jailed, 
  UnJailed, StakeUpdate, ClaimRewards, 
  ConfirmAuction, ShareMinted, ShareBurned, 
  UpdateCommissionRate, DelegatorUnstaked, DelegatorClaimedRewards,
} from '../../generated/StakingInfo/StakingInfo'
import { Validator, Delegator } from '../../generated/schema'

export function handleStaked(event: Staked): void {
    let id = 'validator-' + event.params.validatorId

    let entity = new Validator(id)

    entity.validatorId = event.params.validatorId
    entity.signer = event.params.signer
    entity.activationEpoch = event.params.activationEpoch
    entity.amount = event.params.amount
    entity.total = event.params.total
    entity.signerPubKey = event.params.signerPubKey

    // save entity
    entity.save()
}

export function handleUnstaked(event: Unstaked): void {
    let id = 'validator-' + event.params.validatorId

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
    let id = 'validator-' + event.params.validatorId

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
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.signer = event.params.newSigner
    entity.signerPubKey = event.params.signerPubKey

    // save entity
    entity.save()
}

export function handleRestaked(event: Restaked): void {
    let id = 'validator-' + event.params.validatorId

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
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.jailEndEpoch = event.params.exitEpoch

    // save entity
    entity.save()
}

export function handleUnJailed(event: UnJailed): void {
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    // save entity
    entity.save()
}

export function handleStakeUpdate(event: StakeUpdate): void {
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.amount = event.params.newAmount

    // save entity
    entity.save()
}

export function handleClaimRewards(event: ClaimRewards): void {
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.amount = event.params.amount
    entity.total = event.params.totalAmount

    // save entity
    entity.save()
}

export function handleConfirmAuction(event: ConfirmAuction): void {
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.validatorId = event.params.newValidatorId

    // save entity
    entity.save()
}

export function handleShareMinted(event: ShareMinted): void {
    let id = 'delegator-' + event.params.validatorId + event.params.user.toHexString()

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
    let id = 'delegator-' + event.params.validatorId + event.params.user.toHexString()

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
    let id = 'delegator-' + event.params.validatorId + event.params.user.toHexString()

    let entity = Delegator.load(id)
    if (entity == null) {
      entity = new Delegator(id)
    }

    entity.amount = entity.amount - event.params.amount
    
    // save entity
    entity.save()
}

export function handleDelegatorClaimedRewards(event: DelegatorClaimedRewards): void {
    let id = 'delegator-' + event.params.validatorId + event.params.user.toHexString()

    let entity = Delegator.load(id)
    if (entity == null) {
      entity = new Delegator(id)
    }

    entity.claimedRewards = entity.claimedRewards + event.params.rewards
    
    // save entity
    entity.save()
}

export function handleUpdateCommissionRate(event: UpdateCommissionRate): void {
    let id = 'validator-' + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.commissionRate = event.params.newCommissionRate

    // save entity
    entity.save()
}
