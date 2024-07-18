const { ethers } = require('ethers')
const prompt = require('prompt-sync')()
require('dotenv').config()

const RPC_URL = 'https://rpc.particle.network/evm-chain'
const CHAIN_ID = 11155420
const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID)

function generateRandomAddress() {
  return ethers.Wallet.createRandom().address
}


async function main() {
 const projectId = 'Your Project Id';
 const projectServerKey = 'Your Project Client Or Server Key';
  let wallets = []
  projectId.forEach((Id) => {
    wallets.push(ethers.Wallet.fromprojectId(Id.trim()))
  })
  projectServerKey.forEach((serverkey) => {
    wallets.push(new ethers.Wallet(serverkey.trim()))
  })

  if (wallets.length === 0) {
    console.error('No wallets found')
    process.exit(1)
  }

  wallets = wallets.map((wallet) => wallet.connect(provider))

  const amountToSend = prompt('How much ETH do you want to send (in ETH): ')
  const numAddresses = prompt('How many addresses do you want to send to: ')

  const amountInWei = ethers.parseUnits(amountToSend, 'ether')
  const gasPrice = await provider.getFeeData().then((feeData) => feeData.gasPrice)

  const delayBetweenTransactions = 5000

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i]
    const balance = await provider.getBalance(wallet.address)
    const balanceInEth = ethers.formatEther(balance)
    console.log(`Wallet ${wallet.address} balance: ${balanceInEth} ETH`)

    if (parseFloat(balanceInEth) <= 0) {
      console.error(`Wallet ${wallet.address} Insufficient balance . Skipping transactions for this wallet.`)
      continue
    }

    for (let j = 0; j < numAddresses; j++) {
      const randomAddress = generateRandomAddress()
      const tx = {
        to: randomAddress,
        value: amountInWei,
        gasLimit: 21000,
        gasPrice: gasPrice,
      }

      try {
        const txResponse = await wallet.sendTransaction(tx)
        console.log(`Sent ${amountToSend} ETH from ${wallet.address} to ${randomAddress}`)
        console.log(`Tx Hash: ${txResponse.hash}`)
      } catch (error) {
        console.error(`Failed to send transaction from ${wallet.address} to ${randomAddress}:`, error)
      }

      if (j < numAddresses - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenTransactions))
      }
    }

    if (i < wallets.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenTransactions))
    }
  }
}

main()
