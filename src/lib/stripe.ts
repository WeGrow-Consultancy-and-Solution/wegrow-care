import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
// Using the standard test key for development purposes
export const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
