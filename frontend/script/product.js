const track = document.getElementById('track');
const bigImg = document.getElementById('big-img');
const infoChamp = document.querySelector('.info-champ');

let currentIndex = 0;
let allCenteredImages = []; 
let skinNames = []; // Nouveau : stocke les noms extraits
let currentChampName = ""; // Nouveau : stocke le nom du champion pour le titre

const urlParams = new URLSearchParams(window.location.search);
const champId = urlParams.get('id');

// Fonction pour extraire le nom du skin depuis l'URL
function extractSkinName(url) {
    let fileName = url.split('/').pop(); 
    let cleanName = fileName.replace(/(_centered|_loadscreen)\.png$/i, "");
    return cleanName.replace(/_/g, " ");
}

// Récupération des données du champion
fetch(`http://localhost:6767/champions/${champId}`)
    .then(res => res.json())
    .then(data => {
        track.innerHTML = "";
        allCenteredImages = [];
        skinNames = []; 
        currentChampName = data.name; // Sauvegarde du nom

        // 1. Remplissage des images (Base + Skins)
        allCenteredImages.push("/Backend/" + data.url_centered);
        skinNames.push("Original"); // Nom pour le skin de base
        createSlide("/Backend/" + data.url_loadscreen);

        data.skins.forEach(skin => {
            allCenteredImages.push("/Backend/" + skin.url_centered);
            skinNames.push(extractSkinName(skin.url_centered)); // Extraction du nom du skin
            createSlide("/Backend/" + skin.url_loadscreen);
        });

        // 2. Injection des infos (Nom, Prix, Description)
        renderInfo(data);

        // 3. Premier affichage
        updateCarousel();
    })
    .catch(err => console.error("Erreur Fetch:", err));

// Crée les éléments du carrousel (Inchangé)
function createSlide(url) {
    const img = document.createElement('img');
    img.src = url;
    track.appendChild(img);
}

// Affiche les textes dans la div .info-champ (Inchangé)
function renderInfo(data) {
    const limit = 150;
    const desc = data.description;
    let descHtml = "";

    if (desc.length > limit) {
        const t1 = desc.substring(0, limit);
        const t2 = desc.substring(limit);
        descHtml = `
            <p id="desc-container">
                <span>${t1}</span><span id="more-text" style="display:none">${t2}</span>
                <button id="toggle-btn" onclick="toggleDesc()">Afficher la suite</button>
            </p>`;
    } else {
        descHtml = `<p>${desc}</p>`;
    }

    infoChamp.innerHTML = `
        <h1>${data.name}</h1>
        <p class="price">Prix : ${data.price} ${data.devise}</p>
        ${descHtml}
    `;
}

// Gère le mouvement du carrousel (Modifié pour passer le nom)
function move(direction) {
    const total = track.children.length;
    if (total === 0) return;
    currentIndex = (currentIndex + direction + total) % total;
    updateCarousel();
}

// Met à jour l'image de fond, la position du rail et le TITRE
function updateCarousel() {
    const slides = track.children;
    if (slides.length === 0) return;

    bigImg.src = allCenteredImages[currentIndex];
    
    // Mise à jour dynamique du nom du skin dans le H1
    const h1 = document.querySelector('.info-champ h1');
    if (h1 && currentChampName) {
        const currentSkin = skinNames[currentIndex];
        h1.innerHTML = `${currentChampName} <i style="font-weight: 300; font-size: 0.8em; margin-left: 15px; opacity: 0.7;">"${currentSkin}"</i>`;
    }

    Array.from(slides).forEach(s => s.classList.remove('active'));
    slides[currentIndex].classList.add('active');

    // Décalage pour centrer (33.33% par image)
    const offset = (currentIndex * 33.33) - 33.33;
    track.style.transform = `translateX(${-offset}%)`;
}

// Alterne entre Afficher la suite et Réduire (Inchangé)
function toggleDesc() {
    const moreText = document.getElementById("more-text");
    const btn = document.getElementById("toggle-btn");

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btn.textContent = "Réduire";
    } else {
        moreText.style.display = "none";
        btn.textContent = "Afficher la suite";
    }
}