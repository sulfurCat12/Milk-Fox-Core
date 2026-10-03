import { Client, GatewayIntentBits, AttachmentBuilder, MessageFlags, Embed, EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import foxoPing from './callback/ping.js';
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