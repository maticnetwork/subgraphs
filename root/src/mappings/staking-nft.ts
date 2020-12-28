import { Transfer } from '../../generated/StakingNft/StakingNft'
import { StakingNFTTransfer } from '../../generated/schema'

// To be invoked when staking NFT contracts Transfer event to be emitted
//
// Keeps unique entries by using `tokenId` i.e. NFT ID as GraphQL entity ID
export function handleTransfer(event: Transfer): void {
  let id = 'staking-nft-transfer:' + event.params.tokenId.toString()

  // trying to load entity from store
  let entity = StakingNFTTransfer.load(id)
  if (entity == null) {
    // if not found in store, creating new instance for this NFT
    entity = new StakingNFTTransfer(id)
  }

  entity.tokenId = event.params.tokenId
  entity.currentOwner = event.params.to
    
  let previousOwners = entity.previousOwners
  previousOwners.push(event.params.from)
  entity.previousOwners = previousOwners
 
  let transactionHashes = entity.transactionHashes
  transactionHashes.push(event.transaction.hash)
  entity.transactionHashes = transactionHashes

  // save entity
  entity.save()
}
