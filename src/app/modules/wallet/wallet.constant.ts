/**
 * All money is stored/computed in POISHA (1 BDT = 100 poisha) as
 * integers everywhere — never floats — to avoid rounding drift when
 * combining leftover balances across multiple payments.
 */
export const POISHA_PER_BDT = 100;

/** 9.99 BDT per credit */
export const CREDIT_PRICE_POISHA = 999;

/** Free credits granted once, to every new user, the first time their
 * wallet is created. */
export const FREE_SIGNUP_CREDITS = 3;

export const bdtToPoisha = (bdt: number): number => Math.round(bdt * POISHA_PER_BDT);

export const poishaToBdt = (poisha: number): number => Math.round(poisha / POISHA_PER_BDT);
