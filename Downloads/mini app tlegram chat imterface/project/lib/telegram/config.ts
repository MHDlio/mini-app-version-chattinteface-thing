export const TELEGRAM_BOT_CONFIG = {
  botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  // Mini App launch methods configuration
  launchParams: {
    // Main button in bot profile
    mainButton: {
      text: 'Open Email Generator',
      color: '#2AABEE',
    },
    // Keyboard button in chat
    keyboardButton: {
      text: '📧 Create Email',
    },
    // Inline button in messages
    inlineButton: {
      text: '📝 New Email',
      url: `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}/app`,
    },
    // Menu button configuration
    menuButton: {
      text: 'Email Generator',
      description: 'Create professional emails',
    },
    // Inline mode configuration
    inlineMode: {
      placeholder: 'Create new email...',
      thumbnailUrl: '/icon-inline.png',
    },
    // Attachment menu
    attachmentMenu: {
      text: 'Generate Email',
      iconName: 'email',
    }
  }
};
