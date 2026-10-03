import pull from '../index.js';

export default async function foxoChat(message) {
    // if (message.author.bot) { return; }
    // if (message.author.id !== "883299360350306314") { return; }
    
    const userPrompt = message.content;

    console.log(userPrompt);

    const callback = async (aiResponse) => {
        console.log("---> " + aiResponse);
        await message.reply(aiResponse);
    };
    pull(userPrompt, callback);
}