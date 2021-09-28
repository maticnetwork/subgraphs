import { BigInt } from '@graphprotocol/graph-ts'

import { TokenMappedERC1155, FxDepositERC1155, FxWithdrawERC1155 } from '../../generated/FxERC1155Events/FxERC1155RootTunnel'
import { FxTokenMapping, FxDeposit, FxWithdraw,
  FxTokenMappingCounter, FxDepositCounter, FxWithdrawCounter } from '../../generated/schema'

function getFxTokenMappingCounter(): FxTokenMappingCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-token-mapping-counter'
  let entity = FxTokenMappingCounter.load(id)
  if (entity == null) {

    entity = new FxTokenMappingCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxTokenMappingCounter
}

function getFxDepositCounter(): FxDepositCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-deposit-counter'
  let entity = FxDepositCounter.load(id)
  if (entity == null) {

    entity = new FxDepositCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxDepositCounter
}

function getFxWithdrawCounter(): FxWithdrawCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-withdraw-counter'
  let entity = FxWithdrawCounter.load(id)
  if (entity == null) {

    entity = new FxWithdrawCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxWithdrawCounter
}

export function handleTokenMappedERC1155(event: TokenMappedERC1155): void {
  let counter = getFxTokenMappingCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-token-mapping:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxTokenMapping.load(id)
  if (entity == null) {
    entity = new FxTokenMapping(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.contractAddress = event.address
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.tokenType = 'ERC1155'

  // save entity
  entity.save()
}

export function handleFxDepositERC1155(event: FxDepositERC1155): void {
  let counter = getFxDepositCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-deposit:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxDeposit.load(id)
  if (entity == null) {
    entity = new FxDeposit(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.contractAddress = event.address
  entity.rootToken = event.params.rootToken
  entity.tokenType = 'ERC1155'
  entity.userAddress = event.params.userAddress
  entity.depositor = event.params.depositor
  entity.tokenId = event.params.id
  entity.amount = event.params.amount

  // save entity
  entity.save()
}

export function handleFxWithdrawERC1155(event: FxWithdrawERC1155): void {
  let counter = getFxWithdrawCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-withdraw:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxWithdraw.load(id)
  if (entity == null) {
    entity = new FxWithdraw(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.contractAddress = event.address
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.tokenType = 'ERC1155'
  entity.userAddress = event.params.userAddress
  entity.tokenId = event.params.id
  entity.amount = event.params.amount

  // save entity
  entity.save()
}
