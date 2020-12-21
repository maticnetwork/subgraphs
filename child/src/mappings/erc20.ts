import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Transfer } from '../../generated/ChildERC20/ChildERC20'
import { User } from '../../generated/schema'

let ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

// handleTransfer handles the transfer for ERC20
// Each transfer log will update the balance of `to` and `from` address
export function handleTransfer(event: Transfer): void {
  if (event.params.to != ZERO_ADDRESS) {
    let userToID = event.params.to.toHex()
    let userTo = User.load(userToID)
    if (userTo == null) {
      userTo = new User(userToID)
      userTo.address = event.params.to
      userTo.amount = BigInt.fromI32(0)
    }
    userTo.amount = userTo.amount.plus(event.params.value)
    userTo.save()
  }

  if (event.params.from != ZERO_ADDRESS) {
    let userFromID = event.params.from.toHex()
    let userFrom = User.load(userFromID)
    if (userFrom == null) {
      userFrom = new User(userFromID)
      userFrom.address = event.params.from
      userFrom.amount = BigInt.fromI32(0)
    }
    userFrom.amount = userFrom.amount.minus(event.params.value)
    userFrom.save()
  }
}