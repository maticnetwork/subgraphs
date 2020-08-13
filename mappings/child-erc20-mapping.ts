import { LogTransfer, Withdraw } from '../generated/ChildERC20/childErc20ABI'
import { TransactionEntity } from '../generated/schema'
import { toDecimal } from '../helpers/numbers'

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

// token, from, amount, to
export function handleLogTransfer(event: LogTransfer): void {
    let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + "-logTransfer")

    transactionEntity.from = event.params.from
    transactionEntity.to = event.params.to 
    transactionEntity.value = toDecimal(event.params.amount, 18) 
    transactionEntity.block = event.block.number
    transactionEntity.timestamp = event.block.timestamp
    transactionEntity.transaction = event.transaction.hash
    transactionEntity.token = event.address
    transactionEntity.type = "transfer"

    if (transactionEntity.to.toHex() == ZERO_ADDRESS) {
        return 
    }
    transactionEntity.save()
}

export function handleWithdraw(event: Withdraw): void {
    let transactionEntity = new TransactionEntity(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + "-withdraw")

    transactionEntity.from = event.params.from
    transactionEntity.to = null
    transactionEntity.value = toDecimal(event.params.amount, 18) 
    transactionEntity.block = event.block.number
    transactionEntity.timestamp = event.block.timestamp
    transactionEntity.transaction = event.transaction.hash
    transactionEntity.token = event.address
    transactionEntity.type = "withdraw"

    transactionEntity.save()
}
