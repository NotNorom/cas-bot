const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config()
const cas = require("./cas.js").cas;
const download = require("./download.js").download;
const fsp = require("fs/promises")

const CONFIG_PATH = "./config.json";
var CONFIG = {
    "DEFAULT": {
        prefix: ",",
        strength: 69,
    },
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
        CONFIG = { ...CONFIG, ...json };
    } catch (error) {
        console.error(error);
    }
}

function conf(guild_id, key = null, value = null) {
    if (guild_id === undefined || guild_id === null) {
        guild_id = "DEFAULT";
    }

    if (!(guild_id in CONFIG)) {
        CONFIG[guild_id] = { ...CONFIG["DEFAULT"] };
    }

    if (value === null && key === null) {
        return CONFIG[guild_id];
    }

    if (value === null && key !== null) {
        return CONFIG[guild_id][key];
    }

    if (value !== null && key !== null) {
        if (!(key in CONFIG[guild_id])) { return }
        CONFIG[guild_id][key] = value;
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

        if (!msg.guild.id) {
            return;
        }

        conf(msg.guild.id, key, value);

    } else if (command === "get") {
        if (args.length === 0) {
            let id = msg.guild?.id || "DEFAULT";
            msg.channel.send(JSON.stringify(CONFIG[id], null, 2), { code: "js" });
        } else if (args.length === 1) {
            let key = args.shift();
            let value = conf(msg.guild.id, key);
            if (value === undefined) { return }
            let content = `${key}: ${value}`;

            msg.channel.send(content);
        }
    } else if (command === "save") {
        try {
            await fsp.writeFile(CONFIG_PATH, JSON.stringify(CONFIG, null, 4));
        } catch (e) {
            console.error(e);
        }
    } else if (command === "load") {
        await loadConfig(CONFIG_PATH);
    }
});

loadConfig(CONFIG_PATH)
    .then(() => client.login(process.env.DISCORD_TOKEN))
    .catch((e) => console.error(e));
