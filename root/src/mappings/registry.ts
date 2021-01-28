import { Bytes } from '@graphprotocol/graph-ts'

import { TokenMapped } from '../../generated/Registry/Registry'
import { TokenMapping } from '../../generated/schema'

export function handlePlasmaTokenMapped(event: TokenMapped): void {
  let id = 'plasma-token-mapping-' + event.params.rootToken.toHexString()

  let entity = TokenMapping.load(id)
  if (entity == null) {
    entity = new TokenMapping(id)
  }

  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken

  /*
    Due to some strange error faced in wasm runtime, it was failing to execute 👇 instruction.
    So I'm removing token type checker, not reading contract state anymore
    
    Error in wasm runtime 👇:

    Subgraph instance failed to run: Heap access out of bounds. 
    Offset: 66 Size: 3604585 wasm backtrace: 
    0: 0x1135 - <unknown>!<wasm function 39> 
    1: 0x1205 - <unknown>!<wasm function 40> in handler `handlePlasmaTokenMapped` at block #10168395 (baf3fe6087019f89943ead4b9e1ced78ff90ff4a90b62014a30e88bcec09ed91), 
    code: SubgraphSyncingFailure, 
    id: QmTFWVMke42DdRMfZyfngEFMKdhZ1xCLPeETmnbnh7e7Ag
  */
  entity.tokenType = "unknown" as Bytes

  // Yes, this is plasma mapping handler, so it's a plasma bridge token
  entity.isPOS = false

  entity.timestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  // save entity
  entity.save()
}
