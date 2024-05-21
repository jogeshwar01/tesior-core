use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount,
    },
};

use crate::states::Escrow;

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    initializer: Signer<'info>,
    mint_a: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = initializer
    )]
    initializer_ata_a: Account<'info, TokenAccount>,
    #[account(
        mut,
        has_one = initializer,  // checks if initializer of escrow is the same as the one closing it
        has_one = mint_a,
        close = initializer,    // closes the account by sending lamports to initializer - requires mut
        seeds=[b"state", escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,
    associated_token_program: Program<'info, AssociatedToken>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}