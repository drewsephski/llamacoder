# FieldFlow

FieldFlow demonstrates how a non-technical home-services owner can turn public quote requests into scheduled work without losing the customer context.

## Stable routes

- `/launch-demo/fieldflow`
- `/launch-demo/fieldflow/quote`
- `/launch-demo/fieldflow/dashboard`
- `/launch-demo/fieldflow/customer`

Every route accepts `demoState=default|loading|error|empty|verified|mobile`. Add `demoControls=1` to reveal the fixture controller. Reloading a URL or using the controller reset returns deterministic sample data.

## Talking points

- The value is visible immediately: request, choose a time, receive confirmation.
- The public experience and internal lead workflow share the same customer record.
- Search, lead status, quote amount, appointment state, and customer detail are interactive.
- All names, addresses, email domains, phone numbers, prices, and appointments are fictional sample data.
