const ffmpeg = require("fluent-ffmpeg");
const CliUpdate = require("cli-update");
const sharp = require("sharp");
const fs = require("fs");

const widthSize = 120;
let ASCII = " .:-=+*#%@".split("");

if (!fs.existsSync("frames")) fs.mkdirSync("./frames")
const ffmpegSync = () => {
    return new Promise((resolve, reject) => {
        ffmpeg("video/video.mp4")
            .setStartTime(0)
            .duration(80)
            .format("image2")
            .on('progress', function (progress) {
                process.stdout.write("\u001b[2J\u001b[0;0H");
                CliUpdate.render('Extracted: ' + progress.frames + ' frames');
            })
            .on("end", () => {
                process.stdout.write("\u001b[2J\u001b[0;0H");
                CliUpdate.render("video extracted to ./frames")
                resolve(0);
            })
            .on("error", (err) => {
                process.stdout.write("\u001b[2J\u001b[0;0H");
                CliUpdate.render(err);
            })
            .save("frames/frame_%05d.jpg");
    });
}

const processRGB = (rgb) => {
    let result = ASCII.find((e, i) => {
        if (rgb <= Math.round((Math.round(255 / ASCII.length) * i))) return true
    });
    return (!result) ? "@" : result;
}

const main = async () => {
    await ffmpegSync();
    const frameList = fs.readdirSync("frames");

    frameList.forEach(async (path) => {
        await sharp(`frames/${path}`)
            .resize({
                width: widthSize
            })
            .raw()
            .greyscale()
            .toBuffer()
            .then(async (data) => {
                let result = '';
                data.forEach(async (rgba, i) => {
                    if (i == 0) {
                        result += processRGB(rgba);
                    } else if ((i) % widthSize == 0) {
                        result += processRGB(rgba) + "\n";
                    } else {
                        result += processRGB(rgba);
                    };
                });
                process.stdout.write("\u001b[2J\u001b[0;0H");
                CliUpdate.render(result);
                fs.unlinkSync(`frames/${path}`);
            });
    });
}

main();