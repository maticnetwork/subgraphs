import { BigInt } from '@graphprotocol/graph-ts'

import { TokenMappedERC20, FxDepositERC20, FxWithdrawERC20 } from '../../generated/FxERC20Events/FxERC20RootTunnel'
import { FxERC20TokenMapping, FxERC20Deposit, FxERC20Withdraw,
  FxERC20TokenMappingCounter, FxERC20DepositCounter, FxERC20WithdrawCounter } from '../../generated/schema'

function getFxERC20TokenMappingCounter(): FxERC20TokenMappingCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc20-token-mapping-counter'
  let entity = FxERC20TokenMappingCounter.load(id)
  if (entity == null) {

    entity = new FxERC20TokenMappingCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC20TokenMappingCounter
}

function getFxERC20DepositCounter(): FxERC20DepositCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc20-deposit-counter'
  let entity = FxERC20DepositCounter.load(id)
  if (entity == null) {

    entity = new FxERC20DepositCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC20DepositCounter
}

function getFxERC20WithdrawCounter(): FxERC20WithdrawCounter {
  // Only one entry will be kept in this entity
  let id = 'fx-erc20-withdraw-counter'
  let entity = FxERC20WithdrawCounter.load(id)
  if (entity == null) {

    entity = new FxERC20WithdrawCounter(id)
    entity.current = BigInt.fromI32(0)

  }
  return entity as FxERC20WithdrawCounter
}

export function handleTokenMappedERC20(event: TokenMappedERC20): void {
  let counter = getFxERC20TokenMappingCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc20-mapping:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC20TokenMapping.load(id)
  if (entity == null) {
    entity = new FxERC20TokenMapping(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken

  // save entity
  entity.save()
}

export function handleFxDepositERC20(event: FxDepositERC20): void {
  let counter = getFxERC20DepositCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc20-deposit:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC20Deposit.load(id)
  if (entity == null) {
    entity = new FxERC20Deposit(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.userAddress = event.params.userAddress
  entity.depositor = event.params.depositor
  entity.amount = event.params.amount

  // save entity
  entity.save()
}

export function handleFxWithdrawERC20(event: FxWithdrawERC20): void {
  let counter = getFxERC20WithdrawCounter()
  let updated = counter.current.plus(BigInt.fromI32(1))

  let id = 'fx-erc20-withdraw:' + counter.current.toString()

  // Updating global counter's state
  counter.current = updated
  counter.save()

  let entity = FxERC20Withdraw.load(id)
  if (entity == null) {
    entity = new FxERC20Withdraw(id)
  }

  entity.transactionHash = event.transaction.hash
  entity.timestamp = event.block.timestamp
  entity.counter = counter.current
  entity.rootToken = event.params.rootToken
  entity.childToken = event.params.childToken
  entity.userAddress = event.params.userAddress
  entity.amount = event.params.amount

  // save entity
  entity.save()
}
