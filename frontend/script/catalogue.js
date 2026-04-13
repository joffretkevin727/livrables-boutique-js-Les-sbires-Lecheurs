const API_URL = "http://localhost:6767/champions";
const FAVORIS_URL = "http://localhost:6767/favoris";
const container = document.getElementById('catalog-container');
let allChampions = [];
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id;

let userFavoris = [];

// ==================
// CHARGEMENT DES FAVORIS DU USER
// ==================
const fetchUserFavoris = async () => {
    if (!userId) {
        userFavoris = [];
        return;
    }

    try {
        const res = await fetch(`${FAVORIS_URL}/${userId}`);
        if (!res.ok) throw new Error("Erreur récupération favoris");
        userFavoris = await res.json();
        console.log("Favoris chargés :", userFavoris);
    } catch (err) {
        console.error("Erreur favoris :", err);
        userFavoris = [];
    }
};

const isFavori = (champId) => {
    return userFavoris.some(f => Number(f.champion_id) === Number(champId));
};

const addFavori = async (championId) => {
    try {
        const res = await fetch(FAVORIS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                champion_id: championId
            })
        });

        if (!res.ok) throw new Error("Erreur ajout favori");

        const data = await res.json().catch(() => null);
        console.log("Favori ajouté :", data);
    } catch (err) {
        console.error("Erreur ajout favori :", err);
    }
};

const removeFavori = async (championId) => {
    try {
        const favori = userFavoris.find(f => Number(f.champion_id) === Number(championId));

        if (!favori) {
            console.warn("Favori introuvable pour suppression :", championId);
            return;
        }

        const res = await fetch(`${FAVORIS_URL}/${favori.id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error("Erreur suppression favori");

        console.log("Favori supprimé :", favori.id);
    } catch (err) {
        console.error("Erreur suppression favori :", err);
    }
};

// ==================
// CHARGEMENT DES CHAMPIONS
// ==================
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
        .then(fullDataChampions => {
            allChampions = fullDataChampions; // 🔥 IMPORTANT
            renderChampions(fullDataChampions);
        })
        .catch(error => {
            console.error("Erreur:", error);
            if (container) container.innerHTML = `<p>Erreur de chargement.</p>`;
        });
};

const setupSearch = () => {
    const input = document.getElementById('searchInput');

    input.addEventListener('input', () => {
        const value = input.value.toLowerCase().trim();

        const filtered = allChampions.filter(champ =>
            champ.name.toLowerCase().includes(value)
        );

        renderChampions(filtered);
    });
};

// ==================
// FILTRES
// ==================
function toggleFilterMenu() {
    const menu = document.getElementById('filter-menu');
    menu.classList.toggle('hidden');
}

async function applyFilters() {
    const roles = Array.from(document.querySelectorAll('.filter-role:checked')).map(el => el.value);
    const diffs = Array.from(document.querySelectorAll('.filter-diff:checked')).map(el => el.value);
    const genres = Array.from(document.querySelectorAll('.filter-genre:checked')).map(el => el.value);
    const sortValue = document.getElementById('filter-sort').value;

    let params = new URLSearchParams();
    if (roles.length) params.append('roles', roles.join(','));
    if (diffs.length) params.append('difficultes', diffs.join(','));
    if (genres.length) params.append('genres', genres.join(','));

    const url = `${API_URL}/filter?${params.toString()}`;

    try {
        const res = await fetch(url);
        const list = await res.json();

        const detailPromises = list.map(champ =>
            fetch(`${API_URL}/${champ.id}`).then(res => res.json())
        );
        let fullData = await Promise.all(detailPromises);

        if (sortValue === 'asc') {
            fullData.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'desc') {
            fullData.sort((a, b) => b.price - a.price);
        }

        renderChampions(fullData);
        toggleFilterMenu();
    } catch (err) {
        console.error("Erreur filtrage:", err);
    }
}

// ==================
// RENDU
// ==================
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

        const hasPromo = champ.reduction > 0;
        const finalPrice = hasPromo
            ? Math.floor(champ.price * (1 - champ.reduction / 100))
            : champ.price;

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
                    <button class="fav-btn ${isFavori(champ.id) ? 'active' : ''}" data-id="${champ.id}">❤</button>

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
    setupFavButtons();
};

const setupFavButtons = () => {
    const favButtons = document.querySelectorAll('.fav-btn');

    favButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (!userId) {
                alert("Tu dois être connecté pour utiliser les favoris.");
                return;
            }

            const championId = btn.getAttribute('data-id');

            if (btn.classList.contains('active')) {
                await removeFavori(championId);
                await fetchUserFavoris();
                btn.classList.remove('active');
            } else {
                await addFavori(championId);
                await fetchUserFavoris();
                btn.classList.add('active');
            }
        });
    });
};

const setupClickEvents = () => {
    const cards = document.querySelectorAll('.champion-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.fav-btn')) return;

            const id = card.getAttribute('data-id');
            window.location.href = `http://localhost:6969/product?id=${id}`;
        });
    });
};

window.onclick = function(event) {
    const menu = document.getElementById('filter-menu');
    const btn = event.target.closest('.btn');
    if (menu && !menu.contains(event.target) && !btn) {
        menu.classList.add('hidden');
    }
};

const init = async () => {
    await fetchUserFavoris(); // charge les favoris
    fetchChampions();         // charge les champions
    setupSearch();            // active la recherche
};

init();