const track = document.getElementById('track');
const bigImg = document.getElementById('big-img');
const infoChamp = document.querySelector('.info-champ');

let currentIndex = 0;
let allCenteredImages = []; 
let skinDataArray = []; // Stocke les objets {id, name} de la DB
let currentChampName = ""; 
let pendingSelection = []; // Sélection temporaire avant envoi BDD

const urlParams = new URLSearchParams(window.location.search);
const champId = urlParams.get('id');

// Extrait le nom du skin depuis l'URL
function extractSkinName(url) {
    let fileName = url.split('/').pop(); 
    let cleanName = fileName.replace(/(_centered|_loadscreen)\.png$/i, "");
    return cleanName.replace(/_/g, " ");
}

// Récupération des données du champion et de ses skins
fetch(`http://localhost:6767/champions/${champId}`)
    .then(res => res.json())
    .then(data => {
        track.innerHTML = "";
        allCenteredImages = [];
        skinDataArray = []; 
        currentChampName = data.name;

        // 1. Ajout du skin Original (skin_id est null en BDD)
        allCenteredImages.push("/Backend/" + data.url_centered);
        skinDataArray.push({ id: null, name: "Original" }); 
        createSlide("/Backend/" + data.url_loadscreen);

        // 2. Ajout des skins récupérés de la base de données
        if (data.skins) {
            data.skins.forEach(skin => {
                allCenteredImages.push("/Backend/" + skin.url_centered);
                skinDataArray.push({ 
                    id: skin.id, // ID unique de la table 'skins'
                    name: extractSkinName(skin.url_centered) 
                });
                createSlide("/Backend/" + skin.url_loadscreen);
            });
        }

        renderInfo(data);
        updateCarousel();
    })
    .catch(err => console.error("Erreur Fetch:", err));

function createSlide(url) {
    const img = document.createElement('img');
    img.src = url;
    track.appendChild(img);
}

function renderInfo(data) {
    const limit = 150;
    const desc = data.description || "";
    
    // Logique de promotion
    const hasPromo = data.reduction > 0;
    const finalPrice = hasPromo 
        ? Math.floor(data.price * (1 - data.reduction / 100)) 
        : data.price;

    const priceHtml = hasPromo 
        ? `<p class="price">
            <span style="text-decoration: line-through; color: #ff4e4e; font-size: 0.8em; margin-right: 8px;">${data.price} ${data.devise}</span>
            <span style="color: #d4af37; font-weight: bold;">${finalPrice} ${data.devise}</span>
            <span style="background: #c0392b; color: white; font-size: 0.7em; padding: 2px 5px; border-radius: 3px; margin-left: 10px;">-${Math.round(data.reduction)}%</span>
           </p>`
        : `<p class="price">Prix : ${data.price} ${data.devise}</p>`;

    let descHtml = desc.length > limit 
        ? `<p id="desc-container"><span>${desc.substring(0, limit)}</span><span id="more-text" style="display:none">${desc.substring(limit)}</span><button id="toggle-btn" onclick="toggleDesc()">Afficher la suite</button></p>`
        : `<p>${desc}</p>`;

    infoChamp.innerHTML = `
        <h1>${data.name}</h1>
        ${priceHtml}
        ${descHtml}
        <div class="action-zone">
            <button class="btn-select" onclick="addToPending()">Sélectionner ce skin</button>
            <ul id="selected-skins-list"></ul>
            <button id="confirm-all" onclick="confirmSelection()" style="display:none;">Confirmer l'ajout au panier</button>
        </div>
    `;
}

function move(direction) {
    const total = track.children.length;
    if (total === 0) return;
    currentIndex = (currentIndex + direction + total) % total;
    updateCarousel();
}

function updateCarousel() {
    const slides = track.children;
    if (slides.length === 0) return;
    bigImg.src = allCenteredImages[currentIndex];
    
    const h1 = document.querySelector('.info-champ h1');
    if (h1 && currentChampName) {
        h1.innerHTML = `${currentChampName} <i style="font-weight: 300; font-size: 0.8em; margin-left: 15px; opacity: 0.7;">"${skinDataArray[currentIndex].name}"</i>`;
    }

    Array.from(slides).forEach(s => s.classList.remove('active'));
    slides[currentIndex].classList.add('active');
    const offset = (currentIndex * 33.33) - 33.33;
    track.style.transform = `translateX(${-offset}%)`;
}

function toggleDesc() {
    const moreText = document.getElementById("more-text");
    const btn = document.getElementById("toggle-btn");
    const isHidden = moreText.style.display === "none";
    moreText.style.display = isHidden ? "inline" : "none";
    btn.textContent = isHidden ? "Réduire" : "Afficher la suite";
}

// LOGIQUE PANIER
function addToPending() {
    // currentIndex est l'index actuel du carrousel
    const currentSkin = skinDataArray[currentIndex]; 

    // Debug pour vérifier ce que tu vas envoyer (Ouvre ta console F12)
    console.log("Skin sélectionné :", currentSkin);

    const uniqueTempId = `skin-${currentSkin.id || 'base'}`;

    if (pendingSelection.find(i => i.tempId === uniqueTempId)) {
        alert("Déjà sélectionné.");
        return;
    }

    pendingSelection.push({
        tempId: uniqueTempId,
        realSkinId: currentSkin.id, // Ici, currentSkin.id doit valoir l'ID de la DB (ex: 42)
        name: `${currentChampName} (${currentSkin.name})`
    });
    updateSelectionUI();
}

function updateSelectionUI() {
    const list = document.getElementById('selected-skins-list');
    const btn = document.getElementById('confirm-all');
    
    list.innerHTML = pendingSelection.map((item, index) => `
        <li>
            ${item.name}
            <span class="remove-item" style="cursor:pointer; color:red; margin-left:10px;" onclick="removeFromPending(${index})">&times;</span>
        </li>
    `).join('');
    
    btn.style.display = pendingSelection.length > 0 ? 'block' : 'none';
}

function removeFromPending(index) {
    pendingSelection.splice(index, 1);
    updateSelectionUI();
}

async function confirmSelection() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert("Vous devez être connecté pour ajouter des articles au panier.");
        window.location.href = "connexion";
        return;
    }

    try {
        const cleanChampId = parseInt(champId);
        if (isNaN(cleanChampId)) {
            alert("Erreur : ID du champion invalide.");
            return;
        }

        for (const item of pendingSelection) {
            const response = await fetch('http://localhost:6767/panier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    champion_id: cleanChampId,
                    skin_id: item.realSkinId || null, // On force le null si undefined
                    quantite: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Détail erreur serveur :", errorData);
                throw new Error("Erreur lors de l'insertion");
            }
        }

        pendingSelection = [];
        updateSelectionUI();
        showPopup();
    } catch (error) {
        console.error("Erreur lors de l'ajout au panier:", error);
        alert("Erreur de connexion au serveur.");
    }
}

function showPopup() { document.getElementById('cart-popup').style.display = 'flex'; }
function closePopup() { document.getElementById('cart-popup').style.display = 'none'; }