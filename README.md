# LINE Study Group Bot

A lightweight **Node.js** bot for LINE groups that helps your study club with:

- **FAQ** lookup (`@Bot faq <keyword>`)
- **投票** creation via n8n (`@Bot 投票 <title>`)
- Forwarding any other commands to n8n for custom workflows

## Quick start

1. **Create a LINE Messaging API channel**
   - Get `CHANNEL_ACCESS_TOKEN` and `CHANNEL_SECRET`
   - Set a bot display name (e.g. `StudyHelper`) – this is the name you `@` in the group.
2. **Create a `.env` file** in the project root:
   ```
   LINE_CHANNEL_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
   LINE_CHANNEL_SECRET=YOUR_CHANNEL_SECRET
   LINE_BOT_NAME=StudyHelper   # must match the display name in LINE
   N8N_POLL_WEBHOOK=https://your-n8n.example.com/webhook/poll
   N8N_GENERAL_WEBHOOK=https://your-n8n.example.com/webhook/general
   PORT=3000
   ```
3. **Install dependencies**
   ```bash
   npm ci
   ```
4. **Run locally** (ngrok is handy for HTTPS webhook during development)
   ```bash
   npm start
   ```
   Then set the webhook URL in the LINE console to `https://<your‑ngrok>/webhook`.

## Deploy

You can run the bot anywhere that can expose HTTPS:
- **Docker** (see `Dockerfile`)
- **GitHub Actions** to build & push an image
- **Your own VPS / Cloud Run**

## FAQ data

Place a `data/faq.json` file with an array of objects:
```json
[
  {"q": "開會時間", "a": "每週二晚上 8 點"},
  {"q": "如何加入", "a": "點此連結…"}
]
```
The bot will return the first match.

## License

MIT © oreo0725
