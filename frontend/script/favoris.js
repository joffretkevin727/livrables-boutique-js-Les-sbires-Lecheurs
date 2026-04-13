const container = document.getElementById('favoris-container');

const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id;

// ==================
// RÉCUPÉRER LES FAVORIS
// ==================
const fetchFavoris = async () => {
    if (!userId) {
        container.innerHTML = "<p class='login-message'>Tu dois être connecté pour voir tes favoris.</p>";
        return;
    }

    try {
        const res = await fetch(`http://localhost:6767/favoris/${userId}`);
        
        // Sécurité : si le serveur renvoie 404 ou 500
        if (!res.ok) {
            container.innerHTML = "<p class='empty-message'>Aucun favori pour le moment.</p>";
            return;
        }

        const favoris = await res.json();

        // On vérifie si c't bien un tableau et s'il contient des données
        if (!Array.isArray(favoris) || favoris.length === 0) {
            container.innerHTML = "<p class='empty-message'>Ton grimoire de favoris est vide !</p>";
            return;
        }

        renderFavoris(favoris);

    } catch (err) {
        console.error("Erreur Fetch Favoris:", err);
        // Si le fetch échoue totalement (serveur éteint par exemple)
        container.innerHTML = "<p class='error-message'>Serveur indisponible, réessaie plus tard.</p>";
    }
};

// ==================
// AFFICHAGE
// ==================
const renderFavoris = (favoris) => {
    container.innerHTML = favoris.map(fav => {
        // Logique images
        const defaultImg = `../Backend/${fav.url_loadscreen}`;
        const hoverImg = fav.skin_hover ? `../Backend/${fav.skin_hover}` : defaultImg;

        // Logique prix & promos
        const hasPromo = fav.reduction > 0;
        const finalPrice = hasPromo
            ? Math.floor(fav.price * (1 - fav.reduction / 100))
            : fav.price;

        const priceHTML = hasPromo
            ? `<div class="champ-price promo-active">
                <span class="old-price">${fav.price}</span>
                <span class="current-price">${finalPrice} ${fav.devise || 'RP'}</span>
                <span class="badge-discount">-${Math.round(fav.reduction)}%</span>
               </div>`
            : `<div class="champ-price">${fav.price} ${fav.devise || 'RP'}</div>`;

        return `
        <div class="card champion-card" data-id="${fav.champion_id}">
            <div class="banner">
                <div class="img-champ">
                    <button class="fav-btn active" data-id="${fav.favori_id}">❤</button>

                    <img class="champ-img default" src="${defaultImg}" alt="${fav.name}">
                    <img class="champ-img hover" src="${hoverImg}" alt="${fav.name} skin">
                    ${priceHTML}
                </div>

                <img id="poro_banner" src="frontend/img/poro_bannerv3.png" alt="Decoration">

                <div class="champ-name">
                    <svg viewBox="0 0 200 50" width="220">
                        <defs>
                            <filter id="glow-${fav.champion_id}">
                                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <path d="M0,5 L175,5 L200,45 L25,45 Z" fill="rgba(1, 10, 19, 0.85)" stroke="#C89B3C" stroke-width="2"/>
                        <text x="100" y="30" text-anchor="middle" fill="#F0E6D2" font-family="Arial, sans-serif" font-weight="bold" font-size="14" filter="url(#glow-${fav.champion_id})" style="text-transform: uppercase; letter-spacing: 1.5px;">
                            ${fav.name}
                        </text>
                    </svg>
                </div>
            </div>
        </div>`;
    }).join('');

    setupEvents();
};

// ==================
// EVENTS
// ==================
const setupEvents = () => {

    // click carte
    document.querySelectorAll('.champion-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.fav-btn')) return;

            const id = card.getAttribute('data-id');
            window.location.href = `http://localhost:6969/product?id=${id}`;
        });
    });

    // supprimer favori
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();

            const id = btn.getAttribute('data-id');

            await fetch(`http://localhost:6767/favoris/${id}`, {
                method: 'DELETE'
            });

            fetchFavoris();
        });
    });
};

// ==================
fetchFavoris();