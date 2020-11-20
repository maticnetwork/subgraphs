import { PredicateRegistered } from '../../generated/RootChainManager/RootChainManager'
import { PredicateRegistration } from '../../generated/schema'


export function handlePredicateRegistered(event: PredicateRegistered): void {
  let id = "predicate-registered-" + event.params.tokenType.toHexString()

  let entity = PredicateRegistration.load(id)
  if (entity == null) {
    entity = new PredicateRegistration(id)
  }

  entity.predicateAddress = event.params.predicateAddress
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}
