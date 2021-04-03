const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config()
const cas = require("./cas.js").cas;
const download = require("./download.js").download;
const config = require("./config.js");

async function latest_attachement_url(channel) {
    let messages = await channel.messages.fetch({ limit: 30 });

    let url = messages
        .filter((msg, id) => msg.attachments.size > 0)
        .find((msg, id) => {
            return (msg.attachments.last()?.url)
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
    let prefix = config.get(msg, "prefix");
    console.log(`Prefix for ${msg}: ${prefix}`);

    if (msg.author.bot) { return };
    if (msg.author.id === client.user.id) { return };
    if (!msg.content.startsWith(prefix)) { return };

    let content = msg.content.slice(prefix.length);
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
            let image = await cas(buffer, config.get(msg, "strength"));
            let attachment = new Discord.MessageAttachment(image, "cas.png");
            msg.channel.send(attachment);
        } catch (e) {
            console.error(e);
        }
    } else if (command === "set") {
        if (args.length !== 2) { return };
        let key = args.shift();
        let value = args.shift();

        if (msg.guild.id) {
            config.setGuildConfig(msg.guild.id, key, value);
        } else {
            config.setUserConfig(msg.author.id, key, value);
        }

    } else if (command === "get") {
        let key = args.shift();

        let conf;
        if (msg.guild.id) {
            conf = config.getGuildConfig(msg.guild.id, key || null);
        } else {
            conf = config.getUserConfig(msg.author.id, key || null);
        }

        if (conf === undefined) { return }

        msg.channel.send(JSON.stringify(conf, null, 2), { code: "json" });
    } else if (command === "save") {
        await config.saveConfig();
    } else if (command === "load") {
        await config.loadConfig();
    }
});

config.loadConfig()
    .then(() => client.login(process.env.DISCORD_TOKEN))
    .catch((e) => console.error(e));
