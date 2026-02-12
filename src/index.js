require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);
const app = express();

app.post('/webhook', middleware(config), async (req, res) => {
  const events = req.body.events;
  const promises = events.map(async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') return;
    const text = event.message.text.trim();
    const botName = process.env.LINE_BOT_NAME || 'Bot';
    if (!text.includes(`@${botName}`)) return;
    const command = text.replace(`@${botName}`, '').trim();
    if (command.startsWith('faq')) {
      const answer = await getFaqAnswer(command.slice(3).trim());
      return client.replyMessage(event.replyToken, { type: 'text', text: answer });
    }
    if (command.startsWith('投票')) {
      const pollUrl = await triggerN8nPoll(event.source.groupId, command.slice(2).trim());
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `投票已建立，點此參與 👉 ${pollUrl}`,
      });
    }
    // fallback to n8n
    const reply = await forwardToN8n(event);
    return client.replyMessage(event.replyToken, reply);
  });
  await Promise.all(promises);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Bot listening on port', process.env.PORT || 3000);
});

async function getFaqAnswer(query) {
  const faq = require('../data/faq.json');
  const item = faq.find((f) => f.q.includes(query));
  return item ? item.a : '抱歉，找不到相關答案。';
}

async function triggerN8nPoll(groupId, title) {
  const resp = await fetch(process.env.N8N_POLL_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, title }),
  });
  const data = await resp.json();
  return data.pollUrl;
}

async function forwardToN8n(event) {
  const resp = await fetch(process.env.N8N_GENERAL_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return await resp.json();
}
