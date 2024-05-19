#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("1EJBbgvJ5BRoPjyf73gWVRkDA4xX7vAs2YEZwVqHSdF");

#[program]
pub mod tesior {
    use super::*;

  pub fn close(_ctx: Context<CloseTesior>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tesior.count = ctx.accounts.tesior.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tesior.count = ctx.accounts.tesior.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTesior>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.tesior.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTesior<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Tesior::INIT_SPACE,
  payer = payer
  )]
  pub tesior: Account<'info, Tesior>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTesior<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub tesior: Account<'info, Tesior>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub tesior: Account<'info, Tesior>,
}

#[account]
#[derive(InitSpace)]
pub struct Tesior {
  count: u8,
}
