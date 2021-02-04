import { Address } from '@graphprotocol/graph-ts'

import { Registry, TokenMapped } from '../../generated/Registry/Registry'
import { TokenMapping } from '../../generated/schema'

// Using contract address for creating instance of `Registry`
// contract, to be used for checking whether token is ERC20/ ERC721
import { registryAddress } from '../network'

export function handlePlasmaTokenMapped(event: TokenMapped): void {
  let id = 'plasma-token-mapping-' + event.params.rootToken.toHexString()

  let entity = TokenMapping.load(id)
  if (entity == null) {
    entity = new TokenMapping(id)
  }

  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken

  // Attempting to check from `Registry` contract what kind of
  // token it is.
  //
  // `tokenType` will be any of two possible values for Plasma Tokens
  //
  // 1. keccak256('ERC721') = 0x73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a
  // 2. keccak256('ERC20') = 0x8ae85d849167ff996c04040c44924fd364217285e4cad818292c7ac37c0a345b
  let registry = Registry.bind(Address.fromString(registryAddress))
  entity.tokenType = (registry.isERC721(event.params.rootToken) ? '0x73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a' : '0x8ae85d849167ff996c04040c44924fd364217285e4cad818292c7ac37c0a345b') as String

  // Yes, this is plasma mapping handler, so it's a plasma bridge token
  entity.isPOS = false

  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}
