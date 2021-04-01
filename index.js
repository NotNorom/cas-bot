const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config()
const cas = require("./cas.js").cas;
const download = require("./download.js").download;

const PREFIX = "n."

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

    if (command === "ping") {
        msg.reply("pong");
    }

    if (command === "cas") {
        if (args.length === 0 && msg.attachments.size === 0){
            return;
        }

        let url = "";
        if (args.length > 0) {
            url = args.shift();
        }

        // yes, this is supposed to overwrite an url argument
        if (msg.attachments.size > 0) {
            url = msg.attachments.first().url;
        }
        
        let buffer = await download(url);
        let image = await cas(buffer);

        const attachment = new Discord.MessageAttachment(image, "cas.png");

        msg.reply(attachment);
    }
});


client.login(process.env.DISCORD_TOKEN);
