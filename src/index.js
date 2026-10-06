import ollama from 'ollama';
import fs from 'fs';

const systemPath = 'src/llm/system-s1.txt';

const systemMessage = {
    role: 'system',
    content: fs.readFileSync(systemPath, 'utf-8').trim()
};

function getConversation(userId) {
    const path = `src/llm/conversations/${userId}.json`;

    if (!fs.existsSync(path)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function trigger(userId, usertag, input) {
    const messages = getConversation(userId);
    const now = new Date();

    const timeMessage = {
        role: 'system',
        content: `The current date and time is ${now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila'
        })}.`
    };

    console.log("Prompt: " + input);

    messages.push({
        role: 'user',
        content: input
    });

    const userMessage = {
        role: 'system',
        content: `The person you're talking to is ${usertag}.`
    };

    console.log("Processing...")

    const response = await ollama.chat({
        model: 'llama3.2:3b',
        messages: [
            systemMessage,
            userMessage,
            timeMessage,
            ...messages
        ],
        options: {
            temperature: 0.9,
            top_p: 0.9
        }
    });

    messages.push({
        role: 'assistant',
        content: response.message.content
    });

    const path = `src/llm/conversations/${userId}.json`;

    fs.writeFileSync(path, JSON.stringify(messages, null, 2), 'utf8');

    return response.message.content;
}

export default function pull(userId, usertag, input, callback) {
    trigger(userId, usertag, input).then(async (aiResponse) => {
        await callback(aiResponse);
        console.log("Response: " + aiResponse);
    });
}