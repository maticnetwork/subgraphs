import { PredicateRegistered, TokenMapped } from '../../generated/RootChainManager/RootChainManager'
import { PredicateRegistration, TokenMapping } from '../../generated/schema'


export function handlePredicateRegistered(event: PredicateRegistered): void {
  let id = "predicate-registered-" + event.params.tokenType.toHexString()

  let entity = PredicateRegistration.load(id)
  if (entity == null) {
    entity = new PredicateRegistration(id)
  }

  entity.tokenType = event.params.tokenType
  entity.predicateAddress = event.params.predicateAddress
  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}

export function handleTokenMapped(event: TokenMapped): void {
  let id = "token-mapping-" + event.params.rootToken.toHexString()

  let entity = TokenMapping.load(id)
  if (entity == null) {
    entity = new TokenMapping(id)
  }

  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.tokenType = event.params.tokenType

  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}
