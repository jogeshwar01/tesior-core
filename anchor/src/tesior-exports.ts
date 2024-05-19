// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { Tesior } from '../target/types/tesior';
import { IDL as TesiorIDL } from '../target/types/tesior';

// Re-export the generated IDL and type
export { Tesior, TesiorIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const TESIOR_PROGRAM_ID = new PublicKey(
  '1EJBbgvJ5BRoPjyf73gWVRkDA4xX7vAs2YEZwVqHSdF'
);

// This is a helper function to get the program ID for the Tesior program depending on the cluster.
export function getTesiorProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return TESIOR_PROGRAM_ID;
  }
}
