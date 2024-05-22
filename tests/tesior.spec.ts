import * as anchor from "@coral-xyz/anchor";
import { Tesior } from "../target/types/tesior";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  // TransactionMessage,
  // VersionedTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { randomBytes } from "crypto";

describe("anchor-escrow", () => {
  // 0. Set provider, connection and program
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const connection = provider.connection;
  const program = anchor.workspace.Tesior as anchor.Program<Tesior>;

  // 1. Boilerplate
  // Determine dummy token mints and token account addresses
  const [initializer, taker, mintA, mintB] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  );
  const [initializerAtaA, initializerAtaB, takerAtaA, takerAtaB] = [
    initializer,
    taker,
  ]
    .map((a) =>
      [mintA, mintB].map((m) =>
        getAssociatedTokenAddressSync(m.publicKey, a.publicKey)
      )
    )
    .flat();

  // Determined Escrow and Vault addresses
  const seed = new anchor.BN(randomBytes(8));
  const escrow = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), seed.toArrayLike(Buffer, "le", 8)],
    program.programId
  )[0];
  const vault = getAssociatedTokenAddressSync(mintA.publicKey, escrow, true);

  // 2. Utils
  // Account Wrapper
  const accounts = {
    initializer: initializer.publicKey,
    taker: taker.publicKey,
    mintA: mintA.publicKey,
    mintB: mintB.publicKey,
    initializerAtaA: initializerAtaA,
    initializerAtaB: initializerAtaB,
    takerAtaA,
    takerAtaB,
    escrow,
    vault,
    associatedTokenprogram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  it("Airdrop and create mints", async () => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const tx = new Transaction();

    const fromPubkey = provider.publicKey;
    if (fromPubkey === undefined) {
      throw new Error("Provider public key must be defined");
    }

    tx.instructions = [
      // send 0.01 sol to both initializer and taker
      ...[initializer, taker].map((k) =>
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: k.publicKey,
          lamports: 0.01 * LAMPORTS_PER_SOL,
        })
      ),
      // create accounts for mintA and mintB
      ...[mintA, mintB].map((m) =>
        SystemProgram.createAccount({
          fromPubkey: fromPubkey,
          newAccountPubkey: m.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        })
      ),
      // initialize mint A and B
      // create associated token accounts for initializer and taker
      // mint A tokens to initializerAtaA and B tokens to takerAtaB
      ...[
        [mintA.publicKey, initializer.publicKey, initializerAtaA],
        [mintB.publicKey, taker.publicKey, takerAtaB],
      ].flatMap((x) => [
        createInitializeMint2Instruction(x[0], 6, x[1], null),
        createAssociatedTokenAccountIdempotentInstruction(
          fromPubkey,
          x[2],
          x[1],
          x[0]
        ),
        createMintToInstruction(x[0], x[2], x[1], 1e9),
      ]),
    ];

    await provider
      .sendAndConfirm?.(tx, [mintA, mintB, initializer, taker])
      .then(log);
  });

  it("Initialize", async () => {
    const initializerAmount = 1e6;
    const takerAmount = 1e6;
    await program.methods
      .initialize(
        seed,
        new anchor.BN(initializerAmount),
        new anchor.BN(takerAmount)
      )
      .accounts({ ...accounts })
      .signers([initializer])
      .rpc()
      .then(confirm)
      .then(log);
  });

  xit("Cancel", async () => {
    await program.methods
      .cancel()
      .accounts({ ...accounts })
      .signers([initializer])
      .rpc()
      .then(confirm)
      .then(log);
  });

  // can initialize again here if we need to test `cancel` and `exchange` in same test suite

  it("Exchange", async () => {
    await program.methods
      .exchange()
      .accounts({ ...accounts })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log);

    // For Degugging Purpose

    // const latestBlockhash = await anchor
    //   .getProvider()
    //   .connection.getLatestBlockhash();

    // const ix = await program.methods
    //   .exchange()
    //   .accounts({ ...accounts })
    //   .signers([taker])
    //   .instruction()

    // const msg = new TransactionMessage({
    //   payerKey: provider.publicKey,
    //   recentBlockhash: latestBlockhash.blockhash,
    //   instructions: [ix],
    // }).compileToV0Message();

    // const tx = new VersionedTransaction(msg);
    // tx.sign([taker]);

    // console.log(Buffer.from(tx.serialize()).toString("base64"));
    // await provider.sendAndConfirm(tx).then(log);
  });
});
