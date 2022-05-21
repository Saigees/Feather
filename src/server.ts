import express, { Request } from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload"
import Q from "q";
import { appendFile, existsSync, fstat, mkdirSync, unlink, writeFile } from "fs";
import path from "path";
const app = express();
import keys from "./keys.json";

function getTime(date) {
    const rawDate = new Date(date);
    return `${rawDate.getDate()}/${rawDate.getMonth()}/${rawDate.getFullYear()}`
}

const config = {
    "fileSizeLimit": 52428800,
    "imageUrl": "uploads/",
    "url": "https://feather.saige.wtf"
}

const names = [
    "Saige 👋",
    "You're a qt ;)",
    "Love youu",
    "You're the best!",
    "Logging ips rn /j",
    "~> Saigees/Feather",
    "woah this is cool",
    "~> Saige#0934"
]

const descriptions = [
    "I love women!!",
    "Kanna is cute",
    "Hazel is cute",
    "boop!",
    "beep!",
    "*you can click the title above to see my portfolio :)*",
    "currently being demotivated",
    "i love cats",
    "[twitter @ Saigeees](https://saige.wtf/twitter)",
    "Homework folder: 874GB",
    "IP: [127.0.0.1](https://saige.wtf)",
    `Date ~> ${getTime(Date.now())}`
]

const colour = ["#6E49AB", "#FF65B2"][Math.floor(Math.random() * ["#6E49AB", "#FF65B2"].length)];
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(fileUpload({
    safeFileNames: true,
    preserveExtension: true,
    limits: {
        fileSize: config.fileSizeLimit
    }
}));

app.use('/raw/', express.static(config.imageUrl));
app.use('/d/', express.static("json/"));
app.use(express.static(config.imageUrl))
app.get('/:id', (req, res) => {
    if (!req.params.id) return res.send({ notice: "no id" })
    let description = req.query.d || descriptions[Math.floor(Math.random() * descriptions.length)]
    let name = req.query.n || names[Math.floor(Math.random() * names.length)]
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>filler</title>
    <meta content="${name}" property="og:title" />
    <meta content="${description}" property="og:description" />
    <meta content="https://saige.wtf" property="og:url" />
    <meta content="${config.url}/${req.params.id}.png" property="og:image" />
    <meta name="twitter:card" content="summary_large_image"/>
    <meta content="${colour}" data-react-helmet="true" name="theme-color" />
    <link type="application/json+oembed" href="https://feather.saige.wtf/d/embed.json" />
</head>
<body>
</body>
<script>window.location.href = "https://saige.wtf" </script>
</html>`)
})

if (!existsSync(config.imageUrl)) {
    mkdirSync(config.imageUrl)
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
    const authorization = req.query.key as string | undefined;
    if (!authorization || !keys.includes(authorization)) {
        return res.status(200).json({
            success: true,
            url: `https://saige.wtf`,
            delete_url: `https://saige.wtf`
        })
    }
    //@ts-ignore
    if (!files || files.length < 1) return res.json({ notice: "err" });
    const file = files.image
    const uniqueFilePath = Q.defer();
    const fileName = id(15);
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

    const exists = existsSync(`${process.cwd()}/uploads/${req.params.id
}.png`)
    if (!exists) return res.status(400).send({
        success: false,
        error: {
            message: `File doesnt exist`,
            fix: `supply an actual file id 😭`
        }
    })

    unlink(`${process.cwd()}/uploads/${req.params.id}.png`, (e) => {
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

app.listen(8006, () => {
    console.log(`Listening to port 8006 | http://localhost:8006 : https://feather.saige.wtf`)
})