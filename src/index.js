import ollama from 'ollama';
import fs from 'fs';
import discord from 'discord.js';

const contextPath = './src/context.json';

let rawContextData = fs.readFileSync(contextPath, 'utf-8');
let contextData = JSON.parse(rawContextData);

const message = [
  ... JSON.parse(rawContextData, null, 2)
];

async function trigger(input) {
  const inputData = { role: 'user', content: input}
  message.push(inputData)

  const response = await ollama.chat({
  model: 'llama3:8b',
  messages: message,
  });

  contextData.push(inputData, { role: 'assistant', content: response.message.content});
  return response.message.content;
}

export default function pull(input, callback) { 
    trigger(input).then(async (aiResponse) => {
        fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2), 'utf-8');
        console.log(aiResponse);
        await callback(aiResponse);
    });
}