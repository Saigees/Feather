import { FILE } from "./typings";
import { readdirSync, statSync } from "fs"
import { getTime } from "./server";

/*
*   Stack Overflow 😎
    https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
*/

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const format = async (msg: string, file: FILE) => {
    let txt = msg;
    const date = new Date(Date.now());
    const createdDate = new Date(file.createdDate)
    const extendedFile = { ...file, size: statSync(`${process.cwd()}/uploads/${file.imageName}`).size }
    let uploadFolderSize = 0;
    readdirSync(`${process.cwd()}/uploads`).forEach((file) => {
        uploadFolderSize = uploadFolderSize + (statSync(`${process.cwd()}/uploads/${file}`).size)
    })

    const terms = [
        { old: "{{day}}", value: `${date.getDay()}` },
        { old: "{{month}}", value: `${date.getMonth()}` },
        { old: "{{year}}", value: `${date.getFullYear()}` },
        { old: "{{date}}", value: `${getTime(Date.now())}` },
        { old: "{{file:title}}", value: `${file.name}` },
        { old: "{{file:desc}}", value: `${file.description}` },
        { old: "{{file:id}}", value: `${file.id}` },
        { old: "{{file:type}}", value: `${file.fileType}` },
        { old: "{{file:name}}", value: `${file.imageName}` },
        { old: "{{file:size}}", value: `${formatBytes(extendedFile.size, 0)}` },
        { old: "{{file:created:full}}", value: `${getTime(file.createdDate)}` },
        { old: "{{file:created:day}}", value: `${createdDate.getDay()}` },
        { old: "{{file:created:month}}", value: `${createdDate.getMonth()}` },
        { old: "{{file:created:year}}", value: `${createdDate.getFullYear()}` },
        { old: "{{uploads:size}}", value: `${formatBytes(uploadFolderSize, 0)}` },
        { old: "{{uploads:count}}", value: `${readdirSync(`${process.cwd()}/uploads/`).length}` },
        { old: "{{time:full}}", value: `${date.getHours()}:${date.getMinutes()}` },
        { old: "{{time:hours}}", value: `${date.getHours()}` },
        { old: "{{time:minutes}}", value: `${date.getMinutes()}` },
        { old: "{{time:seconds}}", value: `${date.getSeconds()}` },
    ]

    for (let value of terms) txt = txt.replace(value.old, value.value)
    
    return txt;
}