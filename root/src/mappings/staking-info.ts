import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  Delegator,
  Validator,
  Topup,
  StakingParams,
  GlobalDelegatorCounter,
} from '../../generated/schema'
import {
  ClaimFee,
  ClaimRewards,
  DelegatorClaimedRewards,
  DelegatorUnstaked,
  DynastyValueChange,
  Jailed,
  OwnershipTransferred,
  ProposerBonusChange,
  Restaked,
  ShareBurned,
  ShareMinted,
  SignerChange,
  StakeUpdate,
  Staked,
  ThresholdChange,
  TopUpFee,
  UnJailed,
  UnstakeInit,
  Unstaked,
  UpdateCommissionRate,
  StartAuction,
  ConfirmAuction,
} from '../../generated/StakingInfo/StakingInfo'
import {
  DelegatorUnstakeWithId,
  ShareBurnedWithId,
} from '../../generated/EventsHub/EventsHub'
// using network address from config file
// to be passed to client when creating instance
// of contract, StakingNft, for calling `ownerOf` function
import { stakingNftAddress } from '../network'

// This is the contract we're going to interact with when `Staked` event is emitted
import { StakingNft } from '../../generated/StakingNft/StakingNft'

const STAKING_PARAMS_ID = 'staking:params'


//
// Validator related handlers
//

function loadValidator(validatorId: BigInt): Validator {
  let id = 'validator:' + validatorId.toString()
  let entity = Validator.load(id)
  if (entity == null) {
    entity = new Validator(id)
    entity.validatorId = validatorId
    entity.totalStaked = BigInt.fromI32(0)
    entity.selfStake = BigInt.fromI32(0)
    entity.delegatedStake = BigInt.fromI32(0)
    entity.nonce = BigInt.fromI32(0)
    entity.deactivationEpoch = BigInt.fromI32(0)
    entity.jailEndEpoch = BigInt.fromI32(0)
    entity.liquidatedRewards = BigInt.fromI32(0)
    entity.status = 0
    entity.commissionRate = BigInt.fromI32(0)
    entity.auctionAmount = BigInt.fromI32(0)
    entity.isInAuction = false
  }

  return entity as Validator
}

export function handleStaked(event: Staked): void {
  let validator = loadValidator(event.params.validatorId)

  validator.signer = event.params.signer
  validator.activationEpoch = event.params.activationEpoch

  // Keeping NFT owner address, to be helpful while responding
  // client queries in staking API
  let nft = StakingNft.bind(Address.fromString(stakingNftAddress))
  validator.owner = nft.ownerOf(event.params.validatorId)

  validator.totalStaked = event.params.total
  validator.selfStake = event.params.amount

  validator.signerPubKey = event.params.signerPubkey
  validator.nonce = event.params.nonce
  validator.status = 0

  // save entity
  validator.save()
}

export function handleUnstaked(event: Unstaked): void {
  let validator = loadValidator(event.params.validatorId)

  // update unstaked status
  validator.status = 1
  validator.selfStake = BigInt.fromI32(0)
  validator.save()
}

export function handleUnstakeInit(event: UnstakeInit): void {
  let validator = loadValidator(event.params.validatorId)

  // set deactivation epoch
  validator.deactivationEpoch = event.params.deactivationEpoch
  validator.nonce = event.params.nonce
  validator.save()
}

export function handleSignerChange(event: SignerChange): void {
  let validator = loadValidator(event.params.validatorId)

  // save signer changes
  validator.signer = event.params.newSigner
  validator.signerPubKey = event.params.signerPubkey
  validator.save()
}

export function handleRestaked(event: Restaked): void {
  let validator = loadValidator(event.params.validatorId)

  // update total staked
  validator.totalStaked = event.params.total
  validator.save()
}

export function handleJailed(event: Jailed): void {
  let validator = loadValidator(event.params.validatorId)

  // save entity with jail end epoch
  validator.jailEndEpoch = event.params.exitEpoch
  validator.status = 2
  validator.save()
}

export function handleUnJailed(event: UnJailed): void {
  let validator = loadValidator(event.params.validatorId)

  // save entity with jail end epoch
  validator.jailEndEpoch = BigInt.fromI32(0)
  validator.status = 3
  validator.save()
}

export function handleStakeUpdate(event: StakeUpdate): void {
  let validator = loadValidator(event.params.validatorId)

  // update total staked and nonce
  validator.totalStaked = event.params.newAmount
  validator.nonce = event.params.nonce

  // Updating validator's self stake
  //
  // We only get `totalStake` emitted from contract
  // which is why we're subtracting delegated stake
  // from totalStaked
  validator.selfStake = validator.totalStaked.minus(validator.delegatedStake)

  validator.save()
}

export function handleClaimRewards(event: ClaimRewards): void {
  let validator = loadValidator(event.params.validatorId)

  // update rewards for validator
  validator.liquidatedRewards = validator.liquidatedRewards.plus(event.params.amount)
  validator.save()

  // update staking params
  let stakingParams = loadStakingParams()
  stakingParams.liquidatedRewards = event.params.totalAmount
  stakingParams.save()
}



export function handleUpdateCommissionRate(event: UpdateCommissionRate): void {
  let validator = loadValidator(event.params.validatorId)

  // save validator entity with new commission rate
  validator.commissionRate = event.params.newCommissionRate
  validator.save()
}

//
// Delegator related handlers
//

// Either attempt to read global delegator counter's value
// or create if it's first time being called
//
// Only one entry will be present in `GlobalDelegatorCounter` entity
// Sole purpose of this entity is to keep a global state variable
// which can be used when new delegator comes into picture
function getGlobalDelegatorCounter(): GlobalDelegatorCounter {

  // Only one entry will be kept in this entity
  let id = 'global-delegator-counter'
  let entity = GlobalDelegatorCounter.load(id)
  if (entity == null) {

    entity = new GlobalDelegatorCounter(id)
    entity.current = BigInt.fromI32(0)

  }

  return entity as GlobalDelegatorCounter

}

function loadDelegator(validatorId: BigInt, delegator: Address): Delegator {
  let id = 'delegator:' + validatorId.toString() + ':' + delegator.toHexString()
  let entity = Delegator.load(id)
  if (entity == null) {

    entity = new Delegator(id)
    entity.validatorId = validatorId
    entity.address = delegator
    entity.delegatedAmount = BigInt.fromI32(0)
    entity.claimedAmount = BigInt.fromI32(0)
    entity.unclaimedAmount = BigInt.fromI32(0)
    entity.tokens = BigInt.fromI32(0)
    entity.claimedRewards = BigInt.fromI32(0)

    // -- Attempting to perform global state updation
    //
    // Try to get what's current global delegator counter's state
    // when called for very first time, it'll be `0`
    let counter = getGlobalDelegatorCounter()
    let updated = counter.current.plus(BigInt.fromI32(1))

    // Updating global counter's state
    counter.current = updated

    // Saving this state, so that updated state can be
    // used next time we see a new delegator
    counter.save()
    //
    // -- Done, with global state updation

    // Increment global delegator identifier by 1
    // when this delegator is seen for very first time
    entity.counter = updated

  }

  return entity as Delegator
}

export function handleShareMinted(event: ShareMinted): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update delegatedAmount and tokens
  delegator.delegatedAmount = delegator.delegatedAmount.plus(event.params.amount)
  // this works until tokens are not transaferable
  delegator.tokens = delegator.tokens.plus(event.params.tokens)

  // save entity
  delegator.save()

  // -- Also updating delegated stake for validator
  let validator = loadValidator(event.params.validatorId)

  validator.delegatedStake = validator.delegatedStake.plus(event.params.amount)

  validator.save()
  // -- Saving updation
}

export function handleShareBurned(event: ShareBurned): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update claimedAmount and tokens
  // it is possible to have: claimed amount < amount (when slashing happens)
  // that's why having claimedAmount would be better
  delegator.unclaimedAmount = delegator.unclaimedAmount.plus(event.params.amount)
  // this works until tokens are not transaferable
  delegator.tokens = delegator.tokens.minus(event.params.tokens)
  delegator.delegatedAmount = delegator.delegatedAmount.minus(event.params.amount)

  // save entity
  delegator.save()

  // -- Also updating delegated stake for validator
  let validator = loadValidator(event.params.validatorId)

  validator.delegatedStake = validator.delegatedStake.minus(event.params.amount)

  validator.save()
  // -- Saving updation
}

export function handleShareBurnedWithId(event: ShareBurnedWithId): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update claimedAmount and tokens
  // it is possible to have: claimed amount < amount (when slashing happens)
  // that's why having claimedAmount would be better
  delegator.unclaimedAmount = delegator.unclaimedAmount.plus(event.params.amount)
  // this works until tokens are not transaferable
  delegator.tokens = delegator.tokens.minus(event.params.tokens)
  delegator.delegatedAmount = delegator.delegatedAmount.minus(event.params.amount)

  // save entity
  delegator.save()

  // -- Also updating delegated stake for validator
  let validator = loadValidator(event.params.validatorId)

  validator.delegatedStake = validator.delegatedStake.minus(event.params.amount)

  validator.save()
  // -- Saving updation
}

export function handleDelegatorUnstaked(event: DelegatorUnstaked): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update unclaimed amount by deducting total unclaimed amount
  delegator.unclaimedAmount = delegator.unclaimedAmount.minus(event.params.amount)
  // update claimed amount
  delegator.claimedAmount = delegator.claimedAmount.plus(event.params.amount)

  delegator.save()
}

export function handleDelegatorUnstakeWithId(event: DelegatorUnstakeWithId): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update unclaimed amount by deducting total unclaimed amount
  delegator.unclaimedAmount = delegator.unclaimedAmount.minus(event.params.amount)
  // update claimed amount
  delegator.claimedAmount = delegator.claimedAmount.plus(event.params.amount)

  delegator.save()
}

export function handleDelegatorClaimedRewards(event: DelegatorClaimedRewards): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update total claimed rewards by current event's rewards
  delegator.claimedRewards = delegator.claimedRewards.plus(event.params.rewards)
  delegator.save()
}

//
// Topup
//

function loadTopupAccount(user: Address): Topup {
  let id = 'topup:' + user.toHexString()

  let entity = Topup.load(id)
  if (entity == null) {
    entity = new Topup(id)
    entity.address = user // set user
    entity.topupAmount = BigInt.fromI32(0) // initialize topup amount
    entity.withdrawAmount = BigInt.fromI32(0) // initialize topup amount
  }

  return entity as Topup
}

export function handleClaimFee(event: ClaimFee): void {
  let topup = loadTopupAccount(event.params.user)

  // save entity with topup amount
  topup.topupAmount = topup.topupAmount.plus(event.params.fee)
  topup.save()
}

export function handleTopUpFee(event: TopUpFee): void {
  let topup = loadTopupAccount(event.params.user)

  // save entity with withdraw amount
  topup.withdrawAmount = topup.withdrawAmount.plus(event.params.fee)
  topup.save()
}

//
// Staking params handlers
//

function loadStakingParams(): StakingParams {
  let entity = StakingParams.load(STAKING_PARAMS_ID)
  if (entity == null) {
    entity = new StakingParams(STAKING_PARAMS_ID)
    entity.dynasty = BigInt.fromI32(0)
    entity.proposerBonus = BigInt.fromI32(0)
    entity.validatorThreshold = BigInt.fromI32(0)
    entity.liquidatedRewards = BigInt.fromI32(0)
  }

  return entity as StakingParams
}

export function handleDynastyValueChange(event: DynastyValueChange): void {
  let stakingParams = loadStakingParams()

  // save entity with dynasty
  stakingParams.dynasty = event.params.newDynasty
  stakingParams.save()
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let stakingParams = loadStakingParams()

  // save entity with owner
  stakingParams.owner = event.params.newOwner
  stakingParams.save()
}

export function handleProposerBonusChange(event: ProposerBonusChange): void {
  let stakingParams = loadStakingParams()

  // save entity with proposer bonus
  stakingParams.proposerBonus = event.params.newProposerBonus
  stakingParams.save()
}

export function handleThresholdChange(event: ThresholdChange): void {
  let stakingParams = loadStakingParams()

  // save entity with validator threshold
  stakingParams.validatorThreshold = event.params.newThreshold
  stakingParams.save()
}

export function handleStartAuction(event: StartAuction): void {

  let validator = loadValidator(event.params.validatorId)

  validator.auctionAmount = event.params.auctionAmount
  validator.isInAuction = true

  validator.save()

}

export function handleConfirmAuction(event: ConfirmAuction): void {

  let validator = loadValidator(event.params.oldValidatorId)

  validator.auctionAmount = BigInt.fromI32(0)
  validator.isInAuction = false

  validator.save()

}
