import config from '.';
import Stripe from 'stripe';

export const stripe: any = new Stripe(config.stripe.stripeSecretKey as string);
