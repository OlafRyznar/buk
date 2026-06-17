# BukScan -> n8n email alerts

Two importable n8n workflows that send a nicely formatted match/odds e-mail via
your existing **Gmail OAuth2 API** credential on n8n.nexani.dev.

## Setup

1. In n8n, **Import from File** -> `buk-match-alert.workflow.json`.
2. Open the **Gmail** node and pick your existing "Gmail OAuth2 API" credential
   (the import leaves a placeholder credential id — you need to reselect it).
3. **Activate** the workflow. Open the **Webhook** node and copy its
   **Production URL** (looks like `https://n8n.nexani.dev/webhook/buk-match-alert`).
4. In the BukScan repo, set that URL as `N8N_WEBHOOK_URL` in `.env` (copy from
   `.env.example`) and restart the app.
5. In the app, go to **Ustawienia -> Powiadomienia**, enter your e-mail, turn on
   "Wysyłaj alerty e-mail", pick how many minutes before kickoff, and click
   **"Wyślij testowy e-mail"** to confirm the wiring end-to-end.

Once enabled, the app's server checks scraped matches every minute and POSTs a
payload to the webhook once per match, `emailAlertMinutesBefore` minutes before
kickoff, with the best available odds per outcome.

## Testing inside n8n only

Import `buk-match-alert-test.workflow.json` separately — it has a **Manual
Trigger** with hardcoded sample match data (Portugalia vs DR Konga), so you can
hit "Execute Workflow" in n8n and see the e-mail without touching the app at
all. Edit the email address in the "Sample data" node first.

## Payload shape sent by the app

```json
{
  "isTest": false,
  "email": "user@example.com",
  "event": {
    "id": "scraped-soccer-...",
    "sportTitle": "Mistrzostwa Świata 2026",
    "homeTeam": "Portugalia",
    "awayTeam": "DR Konga",
    "commenceTime": "2026-06-17T17:00:00.000Z",
    "minutesUntil": 30
  },
  "odds": [
    { "bookmaker": "Superbet", "outcome": "Portugalia", "price": 1.33 }
  ]
}
```
