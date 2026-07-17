# Manual credit grants

`CreditGrant.remainingAmount` is the spendable credit ledger. `User.credits` is
an aggregate guard used by billing transactions; it is not sufficient on its
own. Never edit only `User.credits` in Neon.

Use the operator command so the aggregate balance, spendable grant, and audit
history are written in one transaction:

```bash
pnpm credits:grant -- --email user@example.com --amount 25 --reason "Support adjustment"
```

You can target an immutable user id instead:

```bash
pnpm credits:grant -- --user-id user_123 --amount 25 --reason "Support adjustment"
```

The command requires a positive whole number and a reason. It intentionally
creates bonus credits with zero attributed revenue; paid purchases and
subscription renewals must continue through Stripe fulfillment.
