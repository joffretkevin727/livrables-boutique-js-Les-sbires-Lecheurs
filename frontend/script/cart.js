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
            container.innerHTML = "<p class='text-center text-gray-400 py-10'>Votre panier est vide.</p>";
            return;
        }

        container.innerHTML = items.map(item => {
            total += (item.price * item.quantite);
            
            // Si c'est un skin (skin_id non null), on formate le nom via l'URL
            // Sinon on garde le nom du champion
            const displayName = item.skin_id 
                ? formatSkinName(item.final_url_loadscreen, item.champion_name) 
                : item.champion_name;

            return `
                <div class="flex items-center bg-[#002a46] p-4 rounded border border-gray-700 justify-between">
                    <div class="flex items-center gap-4">
                        <img src="/Backend/${item.final_url_loadscreen}" class="w-20 h-24 object-cover rounded shadow-md border border-sky-900">
                        <div>
                            <h3 class="text-lg font-bold text-white">${displayName}</h3>
                            <p class="text-[#d4af37] font-semibold">${item.price} ${item.devise || 'RP'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex items-center border border-gray-600 rounded bg-[#1e2d3d]">
                            <button onclick="updateQty(${item.id}, ${item.quantite - 1})" class="px-3 py-1 hover:text-[#d4af37]">-</button>
                            <span class="px-3 border-x border-gray-600">${item.quantite}</span>
                            <button onclick="updateQty(${item.id}, ${item.quantite + 1})" class="px-3 py-1 hover:text-[#d4af37]">+</button>
                        </div>
                        <button onclick="deleteItem(${item.id})" class="text-red-500 hover:text-red-300 font-bold">Supprimer</button>
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