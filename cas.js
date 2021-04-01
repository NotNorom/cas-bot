const gm = require("gm").subClass({ imageMagick: true });

/**
 * Content aware scale (cas) an image. Will panic if `strength` is out of range.
 * @param {Buffer} image_data Image to cas 
 * @param {Number} strength Amount to cas. Must be an int between 0 and 100. 100 has no effect, 0 will scale the image to 0%, it'll basically be gone
 * @returns Cas'd image buffer
 */
async function gm_cas(image_data, strength = 75) {
    return new Promise((resolve, reject) => {
        if (strength > 100 || strength < 0) {
            reject(new Error(`Strength out of range: ${strength}`));
        }

        gm(image_data)
            .in("-liquid-rescale", `${strength}%`)
            .toBuffer("png", (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer);
            });
    });
}

exports.cas = gm_cas;