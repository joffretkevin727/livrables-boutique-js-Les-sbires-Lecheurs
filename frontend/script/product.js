const track = document.getElementById('track');
const bigImg = document.getElementById('big-img');
const infoChamp = document.querySelector('.info-champ');

let currentIndex = 0;
let allCenteredImages = []; 
let skinNames = []; 
let currentChampName = ""; 
let pendingSelection = []; // Sélection temporaire
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Panier définitif

const urlParams = new URLSearchParams(window.location.search);
const champId = urlParams.get('id');

// Extrait le nom du skin depuis l'URL
function extractSkinName(url) {
    let fileName = url.split('/').pop(); 
    let cleanName = fileName.replace(/(_centered|_loadscreen)\.png$/i, "");
    return cleanName.replace(/_/g, " ");
}

// Récupération des données
fetch(`http://localhost:6767/champions/${champId}`)
    .then(res => res.json())
    .then(data => {
        track.innerHTML = "";
        allCenteredImages = [];
        skinNames = []; 
        currentChampName = data.name;

        allCenteredImages.push("/Backend/" + data.url_centered);
        skinNames.push("Original"); 
        createSlide("/Backend/" + data.url_loadscreen);

        data.skins.forEach(skin => {
            allCenteredImages.push("/Backend/" + skin.url_centered);
            skinNames.push(extractSkinName(skin.url_centered));
            createSlide("/Backend/" + skin.url_loadscreen);
        });

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
    const desc = data.description;
    let descHtml = desc.length > limit 
        ? `<p id="desc-container"><span>${desc.substring(0, limit)}</span><span id="more-text" style="display:none">${desc.substring(limit)}</span><button id="toggle-btn" onclick="toggleDesc()">Afficher la suite</button></p>`
        : `<p>${desc}</p>`;

    infoChamp.innerHTML = `
        <h1>${data.name}</h1>
        <p class="price">Prix : ${data.price} ${data.devise}</p>
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
        h1.innerHTML = `${currentChampName} <i style="font-weight: 300; font-size: 0.8em; margin-left: 15px; opacity: 0.7;">"${skinNames[currentIndex]}"</i>`;
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
    const itemId = `${champId}_${currentIndex}`;
    if (pendingSelection.find(i => i.id === itemId) || cart.find(i => i.id === itemId)) {
        alert("Déjà sélectionné ou dans le panier.");
        return;
    }
    pendingSelection.push({
        id: itemId,
        name: `${currentChampName} (${skinNames[currentIndex]})`
    });
    updateSelectionUI();
}

function updateSelectionUI() {
    const list = document.getElementById('selected-skins-list');
    const btn = document.getElementById('confirm-all');
    
    list.innerHTML = pendingSelection.map((item, index) => `
        <li>
            ${item.name}
            <span class="remove-item" onclick="removeFromPending(${index})">&times;</span>
        </li>
    `).join('');
    
    btn.style.display = pendingSelection.length > 0 ? 'block' : 'none';
}

function removeFromPending(index) {
    pendingSelection.splice(index, 1);
    updateSelectionUI();
}

function confirmSelection() {
    cart = [...cart, ...pendingSelection];
    localStorage.setItem('cart', JSON.stringify(cart));
    pendingSelection = [];
    updateSelectionUI();
    showPopup();
}

function showPopup() { document.getElementById('cart-popup').style.display = 'flex'; }
function closePopup() { document.getElementById('cart-popup').style.display = 'none'; }