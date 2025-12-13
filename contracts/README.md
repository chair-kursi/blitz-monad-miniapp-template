# Typing Tournament - Smart Contracts

## Overview
Solidity smart contracts for the typing tournament escrow and payout system.

## Contract: TypingTournament

### Features
- **Entry Fee Management**: Players pay a fixed entry fee in MON tokens
- **Escrow System**: Securely holds all entry fees until game completion
- **Winner Payout**: Automatically transfers entire pool to winner
- **Owner Control**: Only the game server can declare winners

### Deployment

#### Prerequisites
1. Make sure `.env.local` is configured in the parent directory
2. Ensure deployer wallet has MON tokens (you have 7.89 MON ✅)

#### Steps

```bash
# Install dependencies
npm install

# Compile contract
npm run compile

# Deploy to Monad Testnet
npm run deploy
```

#### After Deployment
1. Copy the contract address from the output
2. Add to `.env.local`:
   ```bash
   CONTRACT_ADDRESS=0x...your-contract-address
   ```
3. The deployment script automatically:
   - Transfers ownership to your server wallet
   - Saves contract ABI to `../lib/contract-abi.json`
   - Saves deployment info to `../deployment-info.json`

### Contract Functions

#### Public Functions
- `enterTournament(uint256 gameId)` - Pay entry fee and join game
- `getGamePool(uint256 gameId)` - View current pool amount
- `hasPlayerPaid(uint256 gameId, address player)` - Check payment status
- `getPlayerCount(uint256 gameId)` - Get number of players in game
- `isGameFinished(uint256 gameId)` - Check if game is finished

#### Owner-Only Functions
- `declareWinner(uint256 gameId, address payable winner)` - Pay winner
- `transferOwnership(address newOwner)` - Transfer contract ownership

### Security Features
- ✅ Only owner can declare winners
- ✅ Players must pay exact entry fee
- ✅ No double-entry allowed
- ✅ Funds locked until winner declared
- ✅ Game can only finish once

### Testing

```bash
# Run tests (coming soon)
npm test
```

### Verification

After deployment, verify on Monad block explorer:
- Contract Address: Check deployment output
- Owner: Should be your SERVER_ADDRESS
- Entry Fee: 0.1 MON

## Troubleshooting

### "Insufficient funds"
- Check deployer balance: Should have at least 0.5 MON for gas
- Get more from faucet if needed

### "Contract deployment failed"
- Verify RPC URL is correct: `https://testnet-rpc.monad.xyz`
- Check network connection
- Ensure private key is correct

### "Ownership transfer failed"
- Verify SERVER_ADDRESS is set in .env.local
- Ensure it's a valid Ethereum address

## Gas Estimates
- Deployment: ~0.1-0.2 MON
- Enter Tournament: ~0.01 MON per player
- Declare Winner: ~0.02 MON

Your deployer wallet (7.89 MON) is sufficient for deployment and testing! ✅
