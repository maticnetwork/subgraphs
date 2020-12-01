import { Staked, Unstaked, UnstakeInit, SignerChange, Restaked, Jailed, UnJailed, StakeUpdate, ClaimRewards, StartAuction } from '../../generated/StakingInfo/StakingInfo'
import { Validator } from '../../generated/schema'

export function handleStaked(event: Staked): void {
    let id = "validator-" + event.params.validatorId

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
    let id = "validator-" + event.params.validatorId

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
    let id = "validator-" + event.params.validatorId

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
    let id = "validator-" + event.params.validatorId

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
    let id = "validator-" + event.params.validatorId

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
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.jailEndEpoch = event.params.exitEpoch

    // save entity
    entity.save()
}

export function handleUnJailed(event: UnJailed): void {
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    // save entity
    entity.save()
}

export function handleStakeUpdate(event: StakeUpdate): void {
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.amount = event.params.newAmount

    // save entity
    entity.save()
}

export function handleClaimRewards(event: ClaimRewards): void {
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.amount = event.params.amount
    entity.total = event.params.totalAmount

    // save entity
    entity.save()
}

export function handleStartAuction(event: StartAuction): void {
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.amount = event.params.amount

    // save entity
    entity.save()
}
