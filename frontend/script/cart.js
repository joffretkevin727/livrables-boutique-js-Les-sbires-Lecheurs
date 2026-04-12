document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Connectez-vous pour voir votre panier.");
        window.location.href = 'connexion';
        return;
    }

    loadCart(user.id);
});

// Ajoute cette petite fonction utilitaire en haut de ton fichier panier.js si elle n'y est pas
function formatSkinName(url, champName) {
    if (!url) return champName;
    let fileName = url.split('/').pop(); // "Blood_Moon_Aatrox_loadscreen.png"
    let cleanName = fileName.replace(/(_centered|_loadscreen)\.png$/i, "").replace(/_/g, " ");
    return cleanName; // "Blood Moon Aatrox"
}

async function loadCart(userId) {
    try {
        const res = await fetch(`http://localhost:6767/panier/${userId}`);
        const items = await res.json();
        const container = document.getElementById('cart-items');
        let total = 0;

        if (!res.ok || items.length === 0) {
            container.innerHTML = "<p class='empty-cart'>Votre panier est vide.</p>";
            return;
        }

        container.innerHTML = items.map(item => {
            // Calcul du prix réduit s'il y a une réduction, sinon prix normal
            const hasPromo = item.reduction > 0;
            const unitPrice = hasPromo 
                ? Math.floor(item.price * (1 - item.reduction / 100)) 
                : item.price;
            
            const lineTotal = unitPrice * item.quantite;
            total += lineTotal;

            const displayName = item.skin_id 
                ? formatSkinName(item.final_url_loadscreen, item.champion_name) 
                : item.champion_name;

            return `
                <div class="cart-card">
                    <div class="cart-card-info">
                        <div class="img-container">
                            <img src="/Backend/${item.final_url_loadscreen}" alt="${displayName}">
                        </div>
                        <div>
                            <h3 class="item-title">${displayName}</h3>
                            <div class="price-display">
                                ${hasPromo ? `<span class="old-price" style="text-decoration: line-through; color: #ff4e4e; font-size: 0.85em; margin-right: 5px;">${item.price}</span>` : ''}
                                <span class="item-price">${unitPrice} ${item.devise || 'RP'}</span>
                                ${hasPromo ? `<span class="promo-badge" style="color: #2ecc71; font-size: 0.8em; margin-left: 5px;">(-${Math.round(item.reduction)}%)</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="cart-card-actions">
                        <div class="qty-selector">
                            <button onclick="updateQty(${item.id}, ${item.quantite - 1})">-</button>
                            <span>${item.quantite}</span>
                            <button onclick="updateQty(${item.id}, ${item.quantite + 1})">+</button>
                        </div>
                        <button onclick="deleteItem(${item.id})" class="btn-delete">Supprimer</button>
                    </div>
                </div>
            `;
        }).join('');

        const devise = items[0]?.devise || 'RP';
        document.getElementById('subtotal').innerText = `${total} ${devise}`;
        document.getElementById('total-price').innerText = `${total} ${devise}`;

    } catch (err) {
        console.error("Erreur chargement panier:", err);
    }
}

async function updateQty(id, newQty) {
    // Met à jour la quantité d'une ligne du panier
    if (newQty < 1) return deleteItem(id);
    await fetch(`http://localhost:6767/panier/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantite: newQty })
    });
    location.reload();
}

async function deleteItem(id) {
    // Supprime un article du panier
    if (confirm("Supprimer cet article ?")) {
        await fetch(`http://localhost:6767/panier/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

function proceedToCheckout() {
    window.location.href = 'delivery';
}