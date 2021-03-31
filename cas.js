const im = require('imagemagick');
const gm = require("gm").subClass({imageMagick: true});

async function convertCall(image_data) {
    let result = "";
    console.log(image_data);
    console.log(typeof image_data);

    var proc = im.convert(["-liquid-rescale 50%", "png:-", "png:-"], (err, stdout, stderr) => {
        if (err) throw err;
        result = res;
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
    });

    proc.stdin.setEncoding('binary');
    proc.stdin.write(image_data, 'binary');
    proc.stdin.end();

    return proc;
}

async function gm_cas(image_data) {

    let result = gm(image_data)
    .command("convert -liquid-rescale 50% -")
    .out("-liquid-rescale 50%")
    .setFormat("jpeg")
    .toBuffer((err, buffer) => {
        if (err) throw err;
        console.log("done casing image");
        return buffer;
    });

    return result;
}


exports.cas = gm_cas;