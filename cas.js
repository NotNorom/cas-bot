const gm = require("gm").subClass({ imageMagick: true });

async function gm_cas(image_data) {
    return new Promise((resolve, reject) => {
        gm(image_data)
            .in("-liquid-rescale", "75%")
            .toBuffer("png", (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
    });

}

exports.cas = gm_cas;