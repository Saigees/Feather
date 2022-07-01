const { mkdirSync, writeFile, writeFileSync, existsSync } = require("fs");

function id(length = 35) {
  let str = "";
  let chars =
    "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopzxcvbnmasdfghjkl";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

const keys = [];
for (let i = 0; i < 5; i++) {
  keys.push(id(55));
}

writeFileSync(`${process.cwd()}/src/keys.json`, JSON.stringify(keys), (e) => {
  console.log(e);
});

if (!existsSync(`${process.cwd()}/src/json_uploads/`)) {
    mkdirSync(`${process.cwd()}/src/json_uploads`, (e) => {
      if (e) console.log(e);
    });


}
if (!existsSync(`${process.cwd()}/uploads/`)) {
  mkdirSync(`${process.cwd()}/uploads`, (e) => {
    if (e) console.log(e);
  });
}

process.exit(0);
