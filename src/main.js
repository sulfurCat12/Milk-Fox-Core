import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import foxoChat from './callback/chat.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('clientReady', function (c) {
    console.log(`✅ ${c.user.tag} is online.`)
});

client.on('messageCreate',
    foxoChat
);

dotenv.config();
client.login(process.env.TOKEN);