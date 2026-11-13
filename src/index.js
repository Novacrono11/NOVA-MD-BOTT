require('dotenv').config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;

    if (connection === 'open') {
      console.log('NOVA-MD-BOT is connected!');
    }

    if (connection === 'close') {
      console.log('Connection closed. Restarting...');
      startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text || '';

    const reply = async (message) => {
      await sock.sendMessage(msg.key.remoteJid, {
        text: message
      });
    };

    if (text === '.menu') {
      await reply(
        '👑 NOVA-MD-BOT\n\n' +
        '.menu - Show menu\n' +
        '.ping - Check bot\n' +
        '.joke - Get a joke\n' +
        '.owner - Bot information'
      );
    }

    if (text === '.ping') {
      await reply('🏓 NOVA-MD-BOT is online!');
    }

    if (text === '.joke') {
      await reply('😂 Why did the computer go to the doctor? Because it had a virus!');
    }

    if (text === '.owner') {
      await reply('👑 NOVA-MD-BOT');
    }
  });
}

startBot().catch(console.error);
