const API_URL = "http://localhost:6767/champions";
const container = document.getElementById('catalog-container');

// CHARGEMENT INITIAL
const fetchChampions = () => {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Erreur liste");
            return response.json();
        })
        .then(list => {
            const detailPromises = list.map(champ => 
                fetch(`${API_URL}/${champ.id}`).then(res => res.json())
            );
            return Promise.all(detailPromises);
        })
        .then(fullDataChampions => renderChampions(fullDataChampions))
        .catch(error => {
            console.error("Erreur:", error);
            if(container) container.innerHTML = `<p>Erreur de chargement.</p>`;
        });
};

// GESTION DES FILTRES
function toggleFilterMenu() {
    const menu = document.getElementById('filter-menu');
    menu.classList.toggle('hidden');
}

async function applyFilters() {
    // 1. Récupération des valeurs des filtres
    const roles = Array.from(document.querySelectorAll('.filter-role:checked')).map(el => el.value);
    const diffs = Array.from(document.querySelectorAll('.filter-diff:checked')).map(el => el.value);
    const genres = Array.from(document.querySelectorAll('.filter-genre:checked')).map(el => el.value);
    const sortValue = document.getElementById('filter-sort').value; // Récupère "asc" ou "desc"

    let params = new URLSearchParams();
    if (roles.length) params.append('roles', roles.join(','));
    if (diffs.length) params.append('difficultes', diffs.join(','));
    if (genres.length) params.append('genres', genres.join(','));

    const url = `${API_URL}/filter?${params.toString()}`;

    try {
        const res = await fetch(url);
        const list = await res.json();
        
        // 2. Fetch des détails (nécessaire pour avoir le prix et les skins)
        const detailPromises = list.map(champ => 
            fetch(`${API_URL}/${champ.id}`).then(res => res.json())
        );
        let fullData = await Promise.all(detailPromises);
        
        // 3. Tri manuel des données reçues (Logique côté client)
        if (sortValue === 'asc') {
            fullData.sort((a, b) => a.price - b.price); // Trie du plus petit au plus grand
        } else if (sortValue === 'desc') {
            fullData.sort((a, b) => b.price - a.price); // Trie du plus grand au plus petit
        }
        
        // 4. Affichage
        renderChampions(fullData);
        toggleFilterMenu();
    } catch (err) {
        console.error("Erreur filtrage:", err);
    }
}

// RENDU DES CARTES
const renderChampions = (champions) => {
    if (champions.length === 0) {
        container.innerHTML = "<p class='col-span-full text-center py-10'>Aucun champion ne correspond à ces critères.</p>";
        return;
    }

    container.innerHTML = champions.map(champ => {
        const defaultImg = `../Backend/${champ.url_loadscreen}`;
        const hoverImg = (champ.skins && champ.skins.length > 0) 
            ? `../Backend/${champ.skins[0].url_loadscreen}` 
            : defaultImg;

        // Calcul de la promotion
        const hasPromo = champ.reduction > 0;
        const finalPrice = hasPromo 
            ? Math.floor(champ.price * (1 - champ.reduction / 100)) 
            : champ.price;

        // Génération du HTML pour le prix
        const priceHTML = hasPromo 
            ? `<div class="champ-price promo-active">
                <span class="old-price">${champ.price}</span>
                <span class="current-price">${finalPrice} ${champ.devise}</span>
                <span class="badge-discount">-${Math.round(champ.reduction)}%</span>
               </div>`
            : `<div class="champ-price">${champ.price} ${champ.devise}</div>`;

        return `
        <div class="card champion-card" data-id="${champ.id}" style="cursor: pointer;">
            <div class="banner">
                <div class="img-champ">
                    <img class="champ-img default" src="${defaultImg}" alt="${champ.name}">
                    <img class="champ-img hover" src="${hoverImg}" alt="${champ.name} skin">
                    ${priceHTML}
                </div>
                
                <img id="poro_banner" src="frontend/img/poro_bannerv3.png" alt="Decoration">

                <div class="champ-name">
                    <svg viewBox="0 0 200 50" width="220">
                        <defs>
                            <filter id="glow-${champ.id}">
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <path d="M0,5 L175,5 L200,45 L25,45 Z" fill="rgba(1, 10, 19, 0.85)" stroke="#C89B3C" stroke-width="2"/>
                        <text x="100" y="30" text-anchor="middle" fill="#F0E6D2" font-family="Arial, sans-serif" font-weight="bold" font-size="14" filter="url(#glow-${champ.id})" style="text-transform: uppercase; letter-spacing: 1.5px;">
                            ${champ.name}
                        </text>
                    </svg>
                </div>
            </div>
        </div>`;
    }).join('');

    setupClickEvents();
};

const setupClickEvents = () => {
    const cards = document.querySelectorAll('.champion-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.href = `http://localhost:6969/product?id=${id}`;
        });
    });
};

// Fermeture du menu au clic extérieur
window.onclick = function(event) {
    const menu = document.getElementById('filter-menu');
    const btn = event.target.closest('.btn');
    if (menu && !menu.contains(event.target) && !btn) {
        menu.classList.add('hidden');
    }
}

fetchChampions();