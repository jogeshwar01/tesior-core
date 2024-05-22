use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub seed: u64,
    pub bump: u8,
    pub initializer: Pubkey,
    pub mint_a: Pubkey,  // mint account of token A 
    pub mint_b: Pubkey,
    pub initializer_amount: u64,
    pub taker_amount: u64,
}

impl Space for Escrow {
    // First 8 Bytes are Discriminator (u64)
    const INIT_SPACE: usize = 8 + 8 + 1 + 32 + 32 + 32 + 8 + 8;
}

// could have used #[derive(InitSpace)] on struct Escrow and then use 8 + Escrow::INIT_SPACE directly
// mint_a and mint_b are defined in order to get the 2 tokens being exchanged in the process