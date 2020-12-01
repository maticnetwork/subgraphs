import { Staked } from '../../generated/StakingInfo/StakingInfo'
import { Validator } from '../../generated/schema'

export function handleStaked(event: Staked): void {
    let id = "validator-" + event.params.validatorId

    let entity = Validator.load(id)
    if (entity == null) {
      entity = new Validator(id)
    }

    entity.validatorId = event.params.validatorId
    entity.signer = event.params.signer
    entity.activationEpoch = event.params.activationEpoch
    entity.amount = event.params.amount
    entity.total = event.params.total
    entity.signerPubKey = event.params.signerPubKey
    entity.status = 0

    // save entity
    entity.save()
}

export function handleUnstaked(event: Staked): void {
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
