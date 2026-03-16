const VERSION = "16.4.1";
const LANG = "fr_FR";

async function getChampionLore() {
  const listUrl = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/${LANG}/champion.json`;
  const listData = await fetch(listUrl).then(r => r.json());

  const champions = Object.keys(listData.data);

  for (const champ of champions) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/${LANG}/champion/${champ}.json`;
    const data = await fetch(url).then(r => r.json());

    const lore = data.data[champ].lore.slice(0, 500);

    console.log(`${champ}:`);
    console.log(lore);
    console.log("--------------------------------------------------");
  }
}

getChampionLore();