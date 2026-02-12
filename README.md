# RusTranslitBot

Telegram inline bot that transliterates Latin text to Russian using Google Input Tools.

## Requirements

- Node.js (recommended: 18+)
- A Telegram bot token (create one via @BotFather)

## Setup

1) Install dependencies:

```bash
npm install
```

2) Configure your bot token.

Create `settings.js` (it is ignored by Git) with:

```js
export const token = 'YOUR_TELEGRAM_BOT_TOKEN';
```

You can also use `example_settings.js` as a template.

## Run

```bash
node index.js
```

## Notes

- The project currently uses ES Modules syntax (`import`).
- The dependency `request` is deprecated and may show `npm audit` vulnerabilities. Consider migrating HTTP calls to the built-in `fetch` (Node 18+) and avoiding `eval`-based response parsing.
