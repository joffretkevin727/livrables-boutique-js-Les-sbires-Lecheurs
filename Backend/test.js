const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const version = "14.24.1";
const baseFolder = "./assets/skins";

function cleanName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_");
}

async function downloadAllSkins() {

    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    const data = await response.json();
    const champions = data.data;

    for (const champ in champions) {

        console.log(`Champion : ${champ}`);

        const champDataRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champ}.json`);
        const champData = await champDataRes.json();

        const skins = champData.data[champ].skins;

        const folder = path.join(baseFolder, champ);
        fs.mkdirSync(folder, { recursive: true });

        for (const skin of skins) {

            const num = skin.num;
            const cleanSkinName = cleanName(skin.name);

            const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ}_${num}.jpg`;

            try {

                const image = await fetch(url);
                const buffer = await image.arrayBuffer();

                const filePath = path.join(folder, `${cleanSkinName}.jpg`);

                fs.writeFileSync(filePath, Buffer.from(buffer));

                console.log(`  ✓ ${skin.name}`);

            } catch (err) {
                console.log(`  ✗ erreur ${skin.name}`);
            }
        }
    }

    console.log("Tous les skins téléchargés !");
}

downloadAllSkins();