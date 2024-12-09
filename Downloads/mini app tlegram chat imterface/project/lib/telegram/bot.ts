import { TELEGRAM_BOT_CONFIG } from './config';

export const botCommands = [
  {
    command: 'start',
    description: 'Start the bot and open main menu',
  },
  {
    command: 'email',
    description: 'Create a new email',
  },
  {
    command: 'help',
    description: 'Show help information',
  },
];

export const botMenuButton = {
  type: 'web_app',
  text: TELEGRAM_BOT_CONFIG.launchParams.menuButton.text,
  web_app: {
    url: TELEGRAM_BOT_CONFIG.appUrl,
  },
};

export const keyboardButtons = [
  [{
    text: TELEGRAM_BOT_CONFIG.launchParams.keyboardButton.text,
    web_app: {
      url: TELEGRAM_BOT_CONFIG.appUrl,
    },
  }],
];

export const inlineKeyboard = [
  [{
    text: TELEGRAM_BOT_CONFIG.launchParams.inlineButton.text,
    web_app: {
      url: TELEGRAM_BOT_CONFIG.appUrl,
    },
  }],
];

export const attachmentMenu = {
  name: TELEGRAM_BOT_CONFIG.launchParams.attachmentMenu.text,
  icon: TELEGRAM_BOT_CONFIG.launchParams.attachmentMenu.iconName,
  type: 'web_app',
  web_app: {
    url: TELEGRAM_BOT_CONFIG.appUrl,
  },
};

// Inline mode handler
export const inlineModeHandler = (query: string) => ({
  type: 'article',
  id: '1',
  title: TELEGRAM_BOT_CONFIG.launchParams.menuButton.text,
  description: TELEGRAM_BOT_CONFIG.launchParams.menuButton.description,
  thumb_url: TELEGRAM_BOT_CONFIG.launchParams.inlineMode.thumbnailUrl,
  input_message_content: {
    message_text: 'Create a professional email with our Mini App!',
  },
  reply_markup: {
    inline_keyboard: inlineKeyboard,
  },
});
