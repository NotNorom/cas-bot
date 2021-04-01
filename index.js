const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config()
const cas = require("./cas.js").cas;
const download = require("./download.js").download;
const fsp = require("fs/promises")

var CONFIG = {
    prefix: ",",
    strength: 75,
}

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

async function loadConfig(path) {
    try {
        let content = await fsp.readFile(path);
        let json = await JSON.parse(content);
        CONFIG = { ...json, ...CONFIG };   
    } catch (error) {
        console.error(error);
    }
}


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
    if (msg.author.bot) { return };
    if (msg.author.id === client.user.id) { return };
    if (!msg.content.startsWith(CONFIG.prefix)) { return };

    let content = msg.content.slice(CONFIG.prefix.length);
    if (content.length <= 0) { return };

    let args = content.split(" ");
    let command = args.shift();

    console.log(`[${msg.createdAt} | ${msg.author.username}] ${command} - ${args}`);

    if (command === "ping") {
        msg.reply("pong");
    } else if (command === "cas") {
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

        try {
            let buffer = await download(url);
            let image = await cas(buffer, CONFIG.strength);
            let attachment = new Discord.MessageAttachment(image, "cas.png");
            msg.channel.send(attachment);
        } catch (e) {
            console.error(e);
        }
    } else if (command === "set") {
        if (args.length !== 2) { return };
        let key = args.shift();
        let value = args.shift();

        if (!(key in CONFIG)) { return }

        CONFIG[key] = value;
    } else if (command === "get") {
        if (args.length === 0) { 
            msg.channel.send(JSON.stringify(CONFIG, null, 2), {code: "js"});
        } else if (args.length === 1) {
            let key = args.shift();
            if (!(key in CONFIG)) { return }

            let value = CONFIG[key];
            let content = `${key}: ${value}`;

            msg.channel.send(content);
        }
    } else if (command === "save") {
        try {
            await fsp.writeFile("./config.json", JSON.stringify(CONFIG, null, 4));
        } catch (e) {
            console.error(e);
        }
    }
});

loadConfig("./config.json")
    .then(() => client.login(process.env.DISCORD_TOKEN))
    .catch((e) => console.error(e));
