import pull from '../index.js';

export default async function foxoChat(message) {
    if (message.author.bot) { return; }
    // if (message.author.id !== "883299360350306314") { return; }
    
    const userPrompt = message.content;
    const callback = async (aiResponse) => {
        await message.reply(aiResponse);
    };
    pull(message.author.id, message.author.tag, userPrompt, callback);
}