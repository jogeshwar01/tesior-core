use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount}
};
// keep version of both anchor_lang and anchor_spl same

use crate::states::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64, initializer_amount: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    #[account(
        mut,
        constraint = initializer_ata_a.amount >= initializer_amount,
        associated_token::mint = mint_a,
        associated_token::authority = initializer,
    )]
    pub initializer_ata_a: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,  // need to import in features of anchor_lang
        payer = initializer,
        space = Escrow::INIT_SPACE,
        seeds = [b"state".as_ref(), &seed.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = mint_a,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>, // needed for directives like init_if_needed 
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}