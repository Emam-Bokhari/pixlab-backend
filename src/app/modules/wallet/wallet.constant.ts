/**
 * All money is stored/computed in POISHA (1 BDT = 100 poisha) as
 * integers everywhere — never floats.
 */
export const POISHA_PER_BDT = 100;

/** 9.99 BDT per credit */
export const CREDIT_PRICE_POISHA = 999;

/** Free credits granted once */
export const FREE_SIGNUP_CREDITS = 3;

export const bdtToPoisha = (bdt: number): number => {
  return Math.round(bdt * POISHA_PER_BDT);
};

export const poishaToBdt = (poisha: number): number => {
  return poisha / POISHA_PER_BDT;
};
