#!/usr/bin/env bun

import {
  displayWallet,
  generateWallet,
  saveWallet,
} from '../../lib/client-wallet';

async function main() {
  console.log('🔐 Generating Client Wallet for x402 Payments');
  console.log('=============================================\n');

  // Generate new wallet
  const wallet = generateWallet();

  // Display wallet info
  displayWallet(wallet);

  // Ask if user wants to save
  console.log('\n💾 Save wallet to file? (y/n)');
  const save = prompt('') || 'n';

  if (save.toLowerCase() === 'y') {
    const filename = prompt('Filename (.wallet.json): ') || '.wallet.json';
    await saveWallet(wallet.mnemonic, filename);
  }

  console.log('\n✨ Wallet generation complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Save your mnemonic phrase securely');
  console.log('2. Fund your wallet with testnet ETH and USDC');
  console.log('3. Add MNEMONIC to your .env file');
  console.log('4. Use the wallet to make x402 payments');
}

main().catch(console.error);
