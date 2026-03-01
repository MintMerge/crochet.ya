# Telegram Bot Setup Guide

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name for your bot (e.g., "Crochet Ya Orders")
4. Choose a username (must end in `bot`, e.g., `crochetya_orders_bot`)
5. BotFather will give you a **Bot Token** like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
6. Save this token securely

## Step 2: Get Your Chat ID

1. Start a conversation with your new bot (search for its username and press Start)
2. Send any message to the bot (e.g., "Hello")
3. Open this URL in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":XXXXXXXX}` in the response
5. The number is your **Chat ID**

**Alternative method:**
- Search for `@userinfobot` on Telegram
- Send `/start` to it
- It will reply with your Chat ID

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
TELEGRAM_CHAT_ID=your-chat-id-number
```

## Step 4: Test the Integration

1. Start the dev server: `npm run dev`
2. Add a product to your cart
3. Fill out the order form and submit
4. Check your Telegram - you should receive a formatted order message

## Message Format

Orders arrive formatted like this:

```
NEW ORDER - Crochet Ya

Order: CY-XXXXX-YYYY

Name: Customer Name
Phone: 9876543210
Address: 123 Street, City - 400001

Order Items:
- Product Name (Variant) x2 - Rs. 998
- Another Product x1 - Rs. 499

Total: Rs. 1,497

Notes: Customer notes here

Ordered at: 28 Feb 2026, 4:32 PM
```

## Troubleshooting

**Not receiving messages?**
- Verify your bot token is correct
- Make sure you've started a conversation with the bot
- Check the chat ID is correct
- Check server logs for Telegram API errors

**Getting 401 errors?**
- Your bot token is invalid or expired
- Generate a new token via BotFather: `/token`

**Getting 400 errors?**
- Chat ID might be wrong
- Make sure you're sending messages to the correct chat
