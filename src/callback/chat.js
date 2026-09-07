import pull from '../index.js';

export default async function foxoChat(message) {
    if (message.author.bot) { return; }
    
    const userPrompt = "[" + message.author.tag + "] " + message.content;

    console.log(userPrompt);

    const callback = async (aiResponse) => {
        await message.reply(aiResponse);
    };
    pull(userPrompt, callback);
}