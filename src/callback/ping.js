export default async function (message) {
    const msgContent = message.content.toLowerCase();
    const prefix = process.env.PREFIX;

    if (message.author.bot) { return; }

    if (msgContent === `${prefix}ping`) {
        const embed0 = new EmbedBuilder()
            .setDescription("Pinging . . .")
            .setColor("#00AFF4");

        const start = Date.now();
        const msg = await message.reply({ embeds: [embed0] });
        const roundTrip = Date.now() - start;
        const apiPing = Math.round(message.client.ws.ping);

        const embed1 = new EmbedBuilder()
            .setTitle("🏓 Pong!")
            .setDescription(`• Bot latency: \`${roundTrip}ms\`\n• API latency: \`${apiPing}ms\``)
            .setColor("#00AFF4");

        await msg.edit({ embeds: [embed1] });
    }
}