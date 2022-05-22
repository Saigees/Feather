const fs = require('fs');
const keys = require("./dist/src/keys.json")
const key = keys[0];
const ps = require("prompt-sync")();

if (!keys || key.lengthn < 1 || !key) {
  console.log('Please run the project once in dev or the built version (npm run build & node dist/src/server.js) before generating the installer')
} 
const title = ps("Please enter an embed title: ")
const desc = ps("Please enter an embed description: ");
console.log(
  'Notice: If you wish to use this on localhost, please use "127.0.0.1" instead of "localhost"'
);
const url = ps("Please enter the url that this will be running on: ");
if (!url) { 
    console.log("Please supply an valid url!")
    process.exit(0)
}
const obj = {
  Version: "13.7.0",
  Name: "ImageUploaderFeather",
  DestinationType: "ImageUploader",
  RequestMethod: "POST",
  RequestURL: `${url}/upload`,
  Parameters: {
    key: `${key}`,
  },
  Body: "MultipartFormData",
  FileFormName: "image",
  URL: "$json:url$",
  DeletionURL: "$json:delete_url$",
};
if (title || desc) {
    obj.Arguments = {}
}
if (title) { obj.Arguments.name = title };
if (desc) { obj.Arguments.desc = desc };
fs.writeFile(`./install.sxcu`, JSON.stringify(obj), (e) => { if (e) console.log(e) });

console.log(`Created your installer. Please run the "install.sxcu" for it to setup your sharex config`)