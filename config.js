const fsp = require("fs/promises")
const CONFIG_PATH = "./config.json";

var CONFIG = {
    "DEFAULT": {
        prefix: ",",
        strength: 69,
    },
    "GUILD": {},
    "USER": {},
}

exports.CONFIG = CONFIG;

async function loadConfig(path = CONFIG_PATH) {
    try {
        let content = await fsp.readFile(path);
        let json = await JSON.parse(content);
        CONFIG = { ...CONFIG, ...json };
    } catch (error) {
        console.error("No config file found. Creating default file.");
        saveConfig();
        //console.error(error);
    }
}

async function saveConfig(path = CONFIG_PATH) {
    try {
        await fsp.writeFile(path, JSON.stringify(CONFIG, null, 4));
    } catch (e) {
        console.error(e);
    }
}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;

/**
 * 
 * @param {Snowflake} id Discord Snowflake
 * @param {String} key What key to modify
 * @param {any} value What value to set
 * @param {String} target Either guild or user id
 * @returns 
 */
function setConf(id, key = null, value = null, target) {
    // create default entry to work on
    if (!(id in CONFIG[target])) {
        CONFIG[target][id] = { ...CONFIG["DEFAULT"] };
    }

    if (key === null) {
        return;
    }

    // don't set an non existant key
    if (!(key in CONFIG["DEFAULT"])) {
        return;
    }

    // reset value if key is provided, but no new value is given
    if (value === null) {
        CONFIG[target][key] = CONFIG["DEFAULT"]["key"];
    }

    CONFIG[target][id][key] = value;
}

exports.setUserConfig = function (id, key, value) {
    setConf(id, key, value, "USER");
}

exports.setGuildConfig = function (id, key, value) {
    setConf(id, key, value, "GUILD");
}


/**
 * 
 * @param {Snowflake} id Discord Snowflake
 * @param {String} key What key to get
 * @param {String} target Either guild or user id
 * @returns Either single config key or whole config if key is null
 */
function getConf(id, key = null, target) {
    // create default entry to work on
    if (!(id in CONFIG[target])) {
        CONFIG[target][id] = { ...CONFIG["DEFAULT"] };
    }

    if ((!key instanceof String)) {
        key = key.toString();
    }

    console.log(CONFIG);

    if (key === null) {
        return { ...CONFIG[target][id] };
    }

    // 
    if (!(key in CONFIG[target][id])) {
        console.log("key not in config: ", target, id, key);
        return undefined;
    }

    console.log("got config: ", target, id, key, CONFIG[target][id][key]);
    return { ...CONFIG[target][id][key] };
}

exports.getUserConfig = function (id, key) {
    getConf(id, key, "USER");
}

exports.getGuildConfig = function (id, key) {
    getConf(id, key, "GUILD");
}


function get(msg, key) {
    let prefix = null;
    if (msg.guild?.id) {
        prefix = exports.getGuildConfig(msg.guild.id, key);
    } else {
        prefix = exports.getUserConfig(msg.author.id, key);
    }

    return prefix || CONFIG["DEFAULT"][key];
}

exports.get = get;