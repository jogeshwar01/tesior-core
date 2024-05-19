import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Tesior } from '../target/types/tesior';

describe('tesior', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Tesior as Program<Tesior>;

  const tesiorKeypair = Keypair.generate();

  it('Initialize Tesior', async () => {
    await program.methods
      .initialize()
      .accounts({
        tesior: tesiorKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([tesiorKeypair])
      .rpc();

    const currentCount = await program.account.tesior.fetch(
      tesiorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment Tesior', async () => {
    await program.methods
      .increment()
      .accounts({ tesior: tesiorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.tesior.fetch(
      tesiorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment Tesior Again', async () => {
    await program.methods
      .increment()
      .accounts({ tesior: tesiorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.tesior.fetch(
      tesiorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement Tesior', async () => {
    await program.methods
      .decrement()
      .accounts({ tesior: tesiorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.tesior.fetch(
      tesiorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set tesior value', async () => {
    await program.methods
      .set(42)
      .accounts({ tesior: tesiorKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.tesior.fetch(
      tesiorKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the tesior account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        tesior: tesiorKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.tesior.fetchNullable(
      tesiorKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
