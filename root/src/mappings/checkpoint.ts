import { BigInt } from '@graphprotocol/graph-ts'
import { NewHeaderBlock } from '../../generated/Rootchain/Rootchain'
import { Checkpoint } from '../../generated/schema'

export function handleNewHeaderBlock(event: NewHeaderBlock): void {
  // checkpoint number is `header block / max_deposits`
  let checkpointNumber = event.params.headerBlockId.div(new BigInt(10000))

  // use checkpoint number as id
  let entity = new Checkpoint("checkpoint:" + checkpointNumber.toString())
  entity.proposer = event.params.proposer
  entity.headerBlockId = event.params.headerBlockId
  entity.checkpointNumber = checkpointNumber
  entity.reward = event.params.reward
  entity.start = event.params.start
  entity.end = event.params.end
  entity.root = event.params.root

  // save entity
  entity.save()
}
