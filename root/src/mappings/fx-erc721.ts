import { BigInt } from '@graphprotocol/graph-ts'

import { TokenMappedERC721, FxDepositERC721, FxWithdrawERC721 } from '../../generated/FxERC721Events/FxERC721RootTunnel'
import { FxERC721TokenMapping, FxERC721Deposit, FxERC721Withdraw,
  FxERC721TokenMappingCounter, FxERC721DepositCounter, FxERC721WithdrawCounter } from '../../generated/schema'

function getFxERC721TokenMappingCounter(): FxERC721TokenMappingCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc721-token-mapping-counter'
  let entity = FxERC721TokenMappingCounter.load(id)
  if (entity == null) {

    entity = new FxERC721TokenMappingCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC721TokenMappingCounter
}

function getFxERC721DepositCounter(): FxERC721DepositCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc721-deposit-counter'
  let entity = FxERC721DepositCounter.load(id)
  if (entity == null) {

    entity = new FxERC721DepositCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC721DepositCounter
}

function getFxERC721WithdrawCounter(): FxERC721WithdrawCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc721-withdraw-counter'
  let entity = FxERC721WithdrawCounter.load(id)
  if (entity == null) {

    entity = new FxERC721WithdrawCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC721WithdrawCounter
}

export function handleTokenMappedERC721(event: TokenMappedERC721): void {
  let counter = getFxERC721TokenMappingCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc721-mapping:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC721TokenMapping.load(id)
  if (entity == null) {
    entity = new FxERC721TokenMapping(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken

  // save entity
  entity.save()
}

export function handleFxDepositERC721(event: FxDepositERC721): void {
  let counter = getFxERC721DepositCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc721-deposit:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC721Deposit.load(id)
  if (entity == null) {
    entity = new FxERC721Deposit(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.userAddress = event.params.userAddress
  entity.depositor = event.params.depositor
  entity.tokenId = event.params.id

  // save entity
  entity.save()
}

export function handleFxWithdrawERC721(event: FxWithdrawERC721): void {
  let counter = getFxERC721WithdrawCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc721-withdraw:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC721Withdraw.load(id)
  if (entity == null) {
    entity = new FxERC721Withdraw(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.userAddress = event.params.userAddress
  entity.tokenId = event.params.id

  // save entity
  entity.save()
}
