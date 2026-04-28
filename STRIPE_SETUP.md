# Stripe Setup Guide

This guide walks you through setting up Stripe for the credit system.

## Prerequisites

- Stripe account (test mode recommended for development)
- Stripe CLI installed (for local webhook testing)

## 1. Environment Variables

Copy the values from `.env.example` to your `.env` file:

```bash
# Required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (already configured in your account)
STRIPE_PRO_PRICE_ID=price_1TQySsRZE8Whwvf0U4nEsJrt
STRIPE_PRO_PLUS_PRICE_ID=price_1TQyStRZE8Whwvf0mciJwsjS
STRIPE_CREDITS_10_PRICE_ID=price_1TQyStRZE8Whwvf0ofuH4dwB
STRIPE_CREDITS_25_PRICE_ID=price_1TQyStRZE8Whwvf0Vwt9tbnK
STRIPE_CREDITS_60_PRICE_ID=price_1TQyStRZE8Whwvf0YJb0BFnI
```

## 2. Stripe Products (Already Created)

Your Stripe account already has these products configured:

### Subscription Plans

| Plan | Price ID | Amount | Credits |
|------|----------|--------|---------|
| Pro | `price_1TQySsRZE8Whwvf0U4nEsJrt` | $9/month | 100 |
| Pro Plus | `price_1TQyStRZE8Whwvf0mciJwsjS` | $29/month | 500 |

### Credit Packs (One-time Purchase)

| Pack | Price ID | Amount | Credits |
|------|----------|--------|---------|
| Small | `price_1TQyStRZE8Whwvf0ofuH4dwB` | $5 | 10 |
| Medium | `price_1TQyStRZE8Whwvf0Vwt9tbnK` | $10 | 25 |
| Large | `price_1TQyStRZE8Whwvf0YJb0BFnI` | $20 | 60 |

## 3. Webhook Setup

### Local Development

1. Install Stripe CLI:

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:

   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) to your `.env`:

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy the signing secret to your production environment

## 4. Testing

### Test Subscription

1. Go to your app dashboard
2. Click "Upgrade"
3. Select "Pro" or "Pro Plus"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future date, any CVC

### Test Credit Purchase

1. Go to dashboard
2. Click "Buy Credits"
3. Select a pack
4. Complete checkout with test card

### Verify Webhook

Check your server logs for:

```
[Stripe Webhook] Received request
[Stripe Webhook] Event verified: checkout.session.completed
[Stripe Webhook] Added credits: 100 to user: xxx
```

## 5. Credit System Behavior

### Free Tier

- 5 free credits on signup
- Can only use free model

### Anonymous Users

- 1 free generation (IP + fingerprint tracked)
- Must sign up to continue

### Pro Tier ($9/month)

- 100 credits monthly
- Access to all models
- Credits roll over

### Pro Plus Tier ($29/month)

- 500 credits monthly
- Access to all models
- Priority support

### Credit Packs

- Never expire
- One-time purchase
- Stack with subscription credits

## 6. Troubleshooting

### Webhook not working

- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify endpoint URL is accessible
- Check server logs for errors

### Credits not added

- Verify price IDs match in code and Stripe
- Check webhook events are being processed
- Look for Prisma errors in logs

### Payment failing

- Use Stripe test cards in development
- Check Stripe Dashboard for failed payments
- Verify product prices are active

## 7. Going Live

1. Switch to production API keys (sk_live_, pk_live_)
2. Update price IDs to production prices
3. Configure production webhook URL
4. Test with real card (small amount)
5. Monitor webhook deliveries in Stripe Dashboard
