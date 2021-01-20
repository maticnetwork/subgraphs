import { TokenMapped } from '../../generated/Registry/Registry'
import { TokenMapping } from '../../generated/schema'

export function handlePlasmaTokenMapped(event: TokenMapped): void {
  let id = 'token-mapping-' + event.params.rootToken.toHexString()

  let entity = TokenMapping.load(id)
  if (entity == null) {
    entity = new TokenMapping(id)
  }

  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.isPOS = false

  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}
