import { BigInt } from '@graphprotocol/graph-ts'

import { TokenMappedERC1155, FxDepositERC1155, FxWithdrawERC1155 } from '../../generated/FxERC1155Events/FxERC1155RootTunnel'
import { FxERC1155TokenMapping, FxERC1155Deposit, FxERC1155Withdraw,
  FxERC1155TokenMappingCounter, FxERC1155DepositCounter, FxERC1155WithdrawCounter } from '../../generated/schema'

function getFxERC1155TokenMappingCounter(): FxERC1155TokenMappingCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc1155-token-mapping-counter'
  let entity = FxERC1155TokenMappingCounter.load(id)
  if (entity == null) {

    entity = new FxERC1155TokenMappingCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC1155TokenMappingCounter
}

function getFxERC1155DepositCounter(): FxERC1155DepositCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc1155-deposit-counter'
  let entity = FxERC1155DepositCounter.load(id)
  if (entity == null) {

    entity = new FxERC1155DepositCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC1155DepositCounter
}

function getFxERC1155WithdrawCounter(): FxERC1155WithdrawCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc1155-withdraw-counter'
  let entity = FxERC1155WithdrawCounter.load(id)
  if (entity == null) {

    entity = new FxERC1155WithdrawCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC1155WithdrawCounter
}

export function handleTokenMappedERC1155(event: TokenMappedERC1155): void {
  let counter = getFxERC1155TokenMappingCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc1155-mapping:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC1155TokenMapping.load(id)
  if (entity == null) {
    entity = new FxERC1155TokenMapping(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken

  // save entity
  entity.save()
}

export function handleFxDepositERC1155(event: FxDepositERC1155): void {
  let counter = getFxERC1155DepositCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc1155-deposit:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC1155Deposit.load(id)
  if (entity == null) {
    entity = new FxERC1155Deposit(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.userAddress = event.params.userAddress
  entity.depositor = event.params.depositor
  entity.tokenId = event.params.id
  entity.amount = event.params.amount

  // save entity
  entity.save()
}

export function handleFxWithdrawERC1155(event: FxWithdrawERC1155): void {
  let counter = getFxERC1155WithdrawCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc1155-withdraw:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC1155Withdraw.load(id)
  if (entity == null) {
    entity = new FxERC1155Withdraw(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.userAddress = event.params.userAddress
  entity.tokenId = event.params.id
  entity.amount = event.params.amount

  // save entity
  entity.save()
}
