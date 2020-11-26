import { Staked } from '../../generated/StakingInfo/StakingInfo'
import { Validator } from '../../generated/schema'

export function handleStaked(event: Staked): void {
    let entity = new Validator("validator-" + event.params.validatorId)

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
