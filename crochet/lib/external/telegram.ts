import axios from 'axios'

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    })
    return response.data.ok
  } catch (error) {
    console.error('Telegram send failed:', error)
    return false
  }
}
