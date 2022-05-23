import express, { Request } from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload"
import Q from "q";
import { appendFile, existsSync, fstat, mkdirSync, readFile, readFileSync, statSync, unlink, writeFile } from "fs";
import path from "path";
const app = express();
import keys from "./keys.json";
import defaults from "./raw/json/defaults.json"
import glob from "glob"
import { promisify } from "util";
import { format } from "./formatters";

const globP = promisify(glob)
const { descriptions, names, colours } = defaults

export function getTime(date) {
    const rawDate = new Date(date);
    return `${rawDate.getDate()}/${rawDate.getMonth()}/${rawDate.getFullYear()}`
}

const config = {
    "fileSizeLimit": 52428800,
    "imageUrl": "uploads/",
    "url": "http://127.0.0.1:8006",
    "imageJsonUrl": "src/json_uploads/",
    "fileExpiresInMs": 1000 * 10 * 60 * 60 * 24 * 7
}


const colour = Object.keys(colours)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(fileUpload({
    safeFileNames: true,
    preserveExtension: true,
}));

app.use('/raw/', express.static(config.imageUrl));
app.use('/~/', express.static("src/raw/"));
app.use(express.static(config.imageUrl))
app.get("/", (req, res) => res.redirect("https://saige.wtf"))
app.get('/:id', async (req, res) => {
    if (!req.params.id || !existsSync(`${process.cwd()}/src/json_uploads/${req.params.id}.json`)) return res.redirect("https://saige.wtf")
    let data: any = readFileSync(`${process.cwd()}/src/json_uploads/${req.params.id}.json`, { encoding: "utf8" })
    data = JSON.parse(data)
    const { name, description, color, hostUrl, topText, raw, fileType, provider_name, provider_url } = data as {
        description: string;
        name: string;
        color: string;
        hostUrl: string;
        topText: string;
        raw: boolean;
        provider_name: string;
        provider_url: string;
        fileType: ".gif" | ".png" | string;
    }
    if (provider_url === "none") {
        delete data['provider_url']
    }
    if (!raw) {
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${await format(topText.slice(35), data)}</title>
    ${name !== "none" ? `
    <meta content="${await format(name, data)}" property="og:title" />
    ` : ""}
    ${description !== "none" ? `
    <meta content="${await format(description, data)}" property="og:description" />`: ""}
    ${topText !== "none" ? `
    <meta content="${await format(topText, data)}" property="og:site_name">
    ` : ""}
    ${hostUrl !== "none" ? `
    <meta content="${hostUrl}" property="og:url" />
    `: ""}
    <meta content="${config.url}/${req.params.id}${data.fileType}" property="og:image" />
    <meta name="twitter:card" content="summary_large_image"/>
    <meta content="${color}" data-react-helmet="true" name="theme-color" />
    ${provider_name !== "none" ? `
    <link type="application/json+oembed" href="${process.cwd() + "/src/json_uploads/" + req.params.id + ".json"} " />` : ""}
</head>
<body>
powered by <a href="https://saige.wtf">saige.wtf</a>
</body>
<script>window.location.href = "https://github.com/Saigees/Feather"</script>
</html>`)
    } else {
        res.send(`${process.cwd()}/uploads/${req.params.id}${data.fileType}`)
    }
})

if (!existsSync(config.imageUrl)) {
    mkdirSync(config.imageUrl)
}
if (!existsSync(config.imageJsonUrl)) {
    mkdirSync(config.imageJsonUrl)
}


function id(length: number = 35) {
    let str = "";
    let chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjkl";
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)]
    }
    return str;
}

app.post("/upload", (req, res) => {

    //@ts-ignore
    const files = req.files
    const { desc, name, color, url, topText, raw, authorName, authorUrl } = req.body;
    let hostUrl = url || "none"
    const authorization = req.query.key as string | undefined;
    if (!authorization || !keys.includes(authorization)) {
        return res.status(200).json({
            success: true,
            url: hostUrl,
            delete_url: hostUrl
        })
    }

    //@ts-ignore
    if (!files || files.length < 1) return res.json({ notice: "err" });
    const file = files.image
    const uniqueFilePath = Q.defer();
    const fileName = id(15);
    const fileType = path.extname(file.name);

    const jsonData = {
        description: desc || "none",
        name: name || "none",
        color: color || colours[colour[Math.floor(Math.random() * colour.length)]],
        imageName: `${fileName}${path.extname(file.name)}`,
        id: fileName,
        fileType,
        createdDate: Date.now(),
        hostUrl,
        provider_name: authorName || "none",
        provider_url: authorUrl || "none",
        topText: topText || "none",
        raw: raw === "true" ? true : false || false
    }

    //@ts-ignore
    uniqueFilePath.resolve({ name: `${fileName}${path.extname(file.name)}`, path: path.join(config.imageUrl, `${fileName}${path.extname(file.name)}`) })
    uniqueFilePath.promise.then((p: { name: string, path: string }) => {

        //@ts-ignore
        file.mv(p.path, (err) => { if (err) return console.log(err) })
        res.status(200).json({
            success: true,
            url: `${config.url}/${fileName}`,
            delete_url: `${config.url}/delete/${fileName}`
        })

    })

    appendFile(`${process.cwd()}/src/json_uploads/${fileName}.json`, JSON.stringify(jsonData), (e) => {
        if (e) console.log(e)
    })

})

app.get("/delete/:id", (req, res) => {
    if (!req.params.id) return res.status(400).send({
        success: false,
        error: {
            message: `No image url supplied`,
            fix: `add an id ( the file id that is supplied when you create it )`
        }
    })
    const authorization = req.query.key as string | undefined;
    if (!authorization || !keys.includes(authorization)) {
        return res.status(400).json({
            success: false,
            url: `https://saige.wtf`,
            delete_url: `https://saige.wtf`
        })
    }
    const exists = existsSync(`${process.cwd()}/src/json_uploads/${req.params.id}.json`)
    if (!exists) return res.status(400).send({
        success: false,
        error: {
            message: `File doesnt exist`,
            fix: `supply an actual file id 😭`
        }
    })
    let data: any = readFileSync(`${process.cwd()}/src/json/${req.params.id}.json`, { encoding: "utf8" })
    data = JSON.parse(data)
    unlink(`${process.cwd()}/uploads/${req.params.id}${data.fileType}`, (e) => {
        console.log(e)
        if (e) return res.status(400).send({
            success: false,
            error: {
                message: `Error deleting your file`,
                fix: `idk try again later 🤷‍♀️`
            }
        })
    })

    res.redirect("https://saige.wtf")
})

function reloadKeys(amount: number = 15) {
    const keys = []
    for (let i = 0; i < 15; i++) {
        keys.push(id(55))
    };

    writeFile(`${__dirname}/keys.json`, JSON.stringify(keys), (e) => { console.log(e) })
}

const keysExist = existsSync(`${__dirname}/keys.json`)
if (!keysExist) {
    reloadKeys()
}
// Delete files after they advance over 1 week expiration date, used for when it releases to the public
// setInterval(async () => {
//     const files: string[] = await globP(`${process.cwd()}/src/json_uploads/*.json`)
//     files.forEach(async (filePath) => {
//         const file = await (await import(filePath)).default
//         const diff = Date.now() - file.createdDate;
//         if (!(diff >= (1000 * 60 * 60 * 24 * 7))) return;
//         unlink(filePath, (e) => { if (e) console.log(e) })
//         unlink(`${process.cwd()}/uploads/${file.imageName}`, (e) => { if (e) console.log(e) })
//     })
// }, config.fileExpiresInMs)


app.get("/*", (req, res) => { res.redirect("https://saige.wtf") })
app.listen(8006, () => {
    console.log(`Listening to port 8006 | http://localhost:8006 : https://feather.saige.wtf`)
}) 