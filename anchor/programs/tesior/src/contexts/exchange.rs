use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        Mint, Token, TokenAccount,
    },
};

use crate::states::Escrow;

// Used Box<Account...> here to prevent stack errors

#[derive(Accounts)]
pub struct Exchange<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub initializer: SystemAccount<'info>,
    pub mint_a: Box<Account<'info, Mint>>,
    pub mint_b: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_a,
        associated_token::authority = taker
    )]
    pub taker_ata_a: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker
    )]
    pub taker_ata_b: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_b,
        associated_token::authority = initializer
    )]
    pub initializer_ata_b: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        has_one = mint_b,
        constraint = taker_ata_b.amount >= escrow.taker_amount,
        close = initializer,
        seeds=[b"state", escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Box<Account<'info, Escrow>>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow
    )]
    pub vault: Box<Account<'info, TokenAccount>>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}