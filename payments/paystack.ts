import { Paystack } from '@paystack/paystack-sdk';
export const paystack:Paystack = new Paystack(process.env.PAYSTACK_SECRET!);



