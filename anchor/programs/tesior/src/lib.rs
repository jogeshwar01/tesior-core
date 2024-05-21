#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
mod contexts;
use contexts::*;
mod states;

declare_id!("1EJBbgvJ5BRoPjyf73gWVRkDA4xX7vAs2YEZwVqHSdF");

#[program]
pub mod tesior {
  use super::*;

  pub fn initialize(
      ctx: Context<Initialize>,
      seed: u64,
      initializer_amount: u64,
      taker_amount: u64,
  ) -> Result<()> {
      Ok(())
  }

  pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
      Ok(())
  }

  pub fn exchange(ctx: Context<Exchange>) -> Result<()> {
      Ok(())
  }
}
