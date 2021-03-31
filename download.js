const fetch = require('node-fetch');

async function download(url) {
    const result = await fetch(url);
    const buffer = await result.arrayBuffer();
    
    return buffer;
}

exports.download = download;