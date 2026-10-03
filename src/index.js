import ollama from 'ollama';
import fs from 'fs';

const contextPath = './src/context.json';

let rawContextData = fs.readFileSync(contextPath, 'utf-8');
let contextData = JSON.parse(rawContextData);

const messages = [...contextData];

async function trigger(input) {
    const userMessage = {
        role: 'user',
        content: input
    };

    messages.push(userMessage);

    const response = await ollama.chat({
        model: 'llama3.2:3b',
        messages,
        options: {
            temperature: 0.9,
            top_p: 0.9
        }
    });

    const assistantMessage = {
        role: 'assistant',
        content: response.message.content
    };

    messages.push(assistantMessage);
    fs.writeFileSync(
        './context.json',
        JSON.stringify(messages, null, 2),
        'utf8'
    );

    return response.message.content;
}

export default function pull(input, callback) { 
    trigger(input).then(async (aiResponse) => {
        fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2), 'utf-8');
        await callback(aiResponse);
        console.log("Response: " + aiResponse);
    });
}