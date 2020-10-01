import { NewHeaderBlock } from '../generated/Rootchain/Rootchain'
import { NewHeaderBlockEntity } from '../generated/schema'

export function handleNewHeaderBlock(event: NewHeaderBlock): void {
  let newHeaderBlockEntity = new NewHeaderBlockEntity(
    event.params.headerBlockId 
    + '-'
    + event.params.root
  )
  newHeaderBlockEntity.proposer = event.params.proposer;
  newHeaderBlockEntity.headerBlockId = event.params.headerBlockId;
  newHeaderBlockEntity.reward = event.params.reward;
  newHeaderBlockEntity.start = event.params.start;
  newHeaderBlockEntity.end = event.params.end;
  newHeaderBlockEntity.root = event.params.root;

  newHeaderBlockEntity.save()
}