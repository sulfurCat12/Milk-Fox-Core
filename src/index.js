import ollama from 'ollama';
import fs from 'fs';

fs.mkdirSync('src/llm/conversations', { recursive: true });
fs.mkdirSync('src/llm/history', { recursive: true });

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

async function createMemories(messages) {
    if (messages.length === 0) {
        return [];
    }

    const conversation = messages
        .map(message => `${message.role}: ${message.content}`)
        .join('\n');

    const response = await ollama.chat({
        model: 'llama3.2:3b',
        messages: [
            {
                role: 'system',
                content: `
                    Summarize this conversation into a few useful memories.

                    Only remember things that may be useful in future conversations.
                    Do not remember greetings, jokes, meaningless small talk, or
                    temporary details.

                    Write each memory as one short bullet point.
                    Do not add explanations.

                    Conversation:
                    ${conversation}
                `
            }
        ],
        options: {
            temperature: 0.3,
            top_p: 0.9
        }
    });

    return response.message.content
        .split('\n')
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
}

async function processOldMessages(userId, messages) {
    const twelveHours = 12 * 60 * 60 * 1000;
    const cutoff = Date.now() - twelveHours;

    const expired = messages.filter(message => message.timestamp < cutoff);

    const recent = messages.filter(message => message.timestamp >= cutoff);

    if (expired.length === 0) { return recent; }

    console.log(`Processing ${expired.length} old messages...`);

    const memories = await createMemories(expired);

    if (memories.length > 0) {
        const history = getHistory(userId);

        history.push(...memories);

        const historyPath = `src/llm/history/${userId}.json`;

        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    }

    return recent;
}

async function trigger(userId, usertag, input) {
    let messages = getConversation(userId);

    messages = await processOldMessages(userId, messages);

    const now = new Date();
    const history = getHistory(userId);

    const timeMessage = {
        role: 'system',
        content: `The current date and time is ${now.toLocaleString('en-US', {
            timeZone: 'Asia/Manila'
        })}.`
    };

    console.log("Prompt: " + input);

    messages.push({
        role: 'user',
        content: input,
        timestamp: Date.now()
    });

    const userMessage = {
        role: 'system',
        content: `The person you're talking to is ${usertag}.`
    };

    const historyMessage = {
        role: 'system',
        content: `Things you remember about this person:
        ${history.map(memory => `- ${memory}`).join('\n')}`
    };

    console.log("Processing...")

    const response = await ollama.chat({
        model: 'llama3.2:3b',
        messages: [
            systemMessage,
            userMessage,
            timeMessage,
            historyMessage,
            ...messages
        ],
        options: {
            temperature: 0.9,
            top_p: 0.9
        }
    });

    messages.push({
        role: 'assistant',
        content: response.message.content,
        timestamp: Date.now()
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