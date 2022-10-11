import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  Delegator,
  Delegation,
  Validator,
  Topup,
  StakingParams,
  GlobalDelegatorCounter,
  GlobalDelegationCounter,
  DelegatorUnbond,
  StakeUpdate as StakeUpdateEntity,
  ValidatorClaimReward,
  ValidatorRestake,
  DelegatorClaimReward,
  DelegatorRestake,
} from '../../generated/schema'
import {
  ClaimFee,
  ClaimRewards,
  DelegatorClaimedRewards,
  DelegatorUnstaked,
  DelegatorRestaked,
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
  StartAuction,
  ConfirmAuction,
} from '../../generated/StakingInfo/StakingInfo'
import {
  DelegatorUnstakeWithId,
  ShareBurnedWithId,
  UpdateCommissionRate,
  SharesTransfer,
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
  validator.totalStaked = event.params.total
  validator.selfStake = validator.selfStake.minus(event.params.amount)
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

  // save restake
  let restake = new ValidatorRestake(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  restake.validatorId = event.params.validatorId
  restake.address = event.transaction.from
  restake.amount = event.params.amount
  restake.totalAmount = event.params.total
  restake.block = event.block.number
  restake.timestamp = event.block.timestamp
  restake.transactionHash = event.transaction.hash
  restake.save()
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

  //Stake update entity
  let stakeUpdate = new StakeUpdateEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  stakeUpdate.totalStaked = event.params.newAmount
  stakeUpdate.nonce = event.params.nonce
  stakeUpdate.block = event.block.number
  stakeUpdate.transactionHash = event.transaction.hash
  stakeUpdate.validatorId = event.params.validatorId
  stakeUpdate.logIndex = event.logIndex

  validator.save()
  stakeUpdate.save()
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

  // save claim
  let claim = new ValidatorClaimReward(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  claim.validatorId = event.params.validatorId
  claim.address = event.transaction.from
  claim.amount = event.params.amount
  claim.totalAmount = event.params.totalAmount
  claim.block = event.block.number
  claim.timestamp = event.block.timestamp
  claim.transactionHash = event.transaction.hash
  claim.save()
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

function loadDelegatorUnbond(validatorId: BigInt, delegator: Address, nonce: BigInt): DelegatorUnbond {
  let id = 'delegatorUnbond:' + delegator.toHexString() + ':' + validatorId.toString() + ':' + nonce.toString()
  let entity = DelegatorUnbond.load(id)
  if (entity == null) {
    entity = new DelegatorUnbond(id)
    entity.validatorId = validatorId
    entity.user = delegator
    entity.nonce = nonce
    entity.amount = BigInt.fromI32(0)
    entity.tokens = BigInt.fromI32(0)
    entity.completed = false
  }
  return entity as DelegatorUnbond
}

function getGlobalDelegationCounter(): GlobalDelegationCounter {
  // Only one entry will be kept in this entity
  let id = 'global-delegation-counter'
  let entity = GlobalDelegationCounter.load(id)
  if (entity == null) {

    entity = new GlobalDelegationCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as GlobalDelegationCounter
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

  // entity for single delegation
  let globalDelegationCounter = getGlobalDelegationCounter()
  let updated = globalDelegationCounter.current.plus(BigInt.fromI32(1))
  globalDelegationCounter.current = updated
  globalDelegationCounter.save()

  let id = event.transaction.hash.toHexString()
  let delegation = new Delegation(id)
  delegation.counter = updated
  delegation.validatorId = event.params.validatorId
  delegation.address = event.params.user
  delegation.block = event.block.number
  delegation.timestamp = event.block.timestamp
  delegation.transactionHash = event.transaction.hash
  delegation.amount = event.params.amount
  delegation.activeStake = delegator.delegatedAmount

  delegation.save()
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
  validator.totalStaked = validator.totalStaked.minus(event.params.amount)

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
  validator.totalStaked = validator.totalStaked.minus(event.params.amount)

  validator.save()
  // -- Saving updation

  // save unbond details with nonce value
  let delegatorUnbond = loadDelegatorUnbond(event.params.validatorId, event.params.user, event.params.nonce)
  delegatorUnbond.amount = event.params.amount
  delegatorUnbond.tokens = event.params.tokens
  delegatorUnbond.unbondStartedTxHash = event.transaction.hash
  delegatorUnbond.unbondStartedTimeStamp = event.block.timestamp
  delegatorUnbond.activeStake = delegator.delegatedAmount

  // save entity
  delegatorUnbond.save()
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

  // save unbond details with completed as false
  let delegatorUnbond = loadDelegatorUnbond(event.params.validatorId, event.params.user, event.params.nonce)
  delegatorUnbond.completed = true
  delegatorUnbond.unbondClaimedTxHash = event.transaction.hash
  delegatorUnbond.unbondClaimedTimeStamp = event.block.timestamp

  // save entity
  delegatorUnbond.save()
}

export function handleDelegatorClaimedRewards(event: DelegatorClaimedRewards): void {
  let delegator = loadDelegator(event.params.validatorId, event.params.user)

  // update total claimed rewards by current event's rewards
  delegator.claimedRewards = delegator.claimedRewards.plus(event.params.rewards)
  delegator.save()

  // save claim
  let claim = new DelegatorClaimReward(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  claim.validatorId = event.params.validatorId
  claim.user = event.params.user
  claim.rewards = event.params.rewards
  claim.block = event.block.number
  claim.timestamp = event.block.timestamp
  claim.transactionHash = event.transaction.hash
  claim.save()
}

export function handleSharesTransfer(event: SharesTransfer): void {
  let fromDelegator = loadDelegator(event.params.validatorId, event.params.from)
  let toDelegator = loadDelegator(event.params.validatorId, event.params.to)

  fromDelegator.delegatedAmount = fromDelegator.delegatedAmount.minus(event.params.value)
  // update claimed amount
  toDelegator.delegatedAmount = toDelegator.delegatedAmount.plus(event.params.value)

  fromDelegator.save()
  toDelegator.save()
}

export function handleDelegatorRestaked(event: DelegatorRestaked): void {
  // just save restake event
  let restake = new DelegatorRestake(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  restake.validatorId = event.params.validatorId
  restake.user = event.params.user
  restake.totalStaked = event.params.totalStaked
  restake.block = event.block.number
  restake.timestamp = event.block.timestamp
  restake.transactionHash = event.transaction.hash
  restake.save()
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
