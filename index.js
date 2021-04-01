const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config()
const cas = require("./cas.js").cas;
const download = require("./download.js").download;

const PREFIX = ","

async function latest_attachement_url(channel) {
    let messages = await channel.messages.fetch({ limit: 30 });

    let url = messages
        .filter((msg, id) => msg.attachments.size > 0)
        .find((msg, id) => {
            return (msg.attachments.first()?.url)
        })?.attachments.first().url;

    if (url) {
        return url;
    } else {
        throw new Error("No urls in the last few messages");
    }
}


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
    if (msg.author.bot) { return };
    if (msg.author.id === client.user.id) { return };
    if (!msg.content.startsWith(PREFIX)) { return };

    let content = msg.content.slice(PREFIX.length);
    if (content.length <= 0) { return };

    let args = content.split(" ");
    let command = args.shift();

    console.log(`[${msg.createdAt} | ${msg.author.username}] ${command} - ${args}`);

    if (command === "ping") {
        msg.reply("pong");
    }

    if (command === "cas") {
        let url = "";

        if (args.length === 0 && msg.attachments.size === 0) {
            try {
                url = await latest_attachement_url(msg.channel)
            } catch (error) {
                console.error(error);
            }
        }

        if (args.length > 0) {
            url = args.shift();
        }

        // yes, this is supposed to overwrite an url argument
        if (msg.attachments.size > 0) {
            url = msg.attachments.first().url;
        }

        if (url?.length <= 0) { return }

        let buffer = await download(url);
        let image = await cas(buffer);

        const attachment = new Discord.MessageAttachment(image, "cas.png");

        msg.channel.send(attachment);
    }
});


client.login(process.env.DISCORD_TOKEN);
