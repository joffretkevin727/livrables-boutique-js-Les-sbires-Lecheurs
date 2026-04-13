const user = JSON.parse(localStorage.getItem('user'));
let selectedAddressId = null;
let cartItems = [];
let totalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (!user) return window.location.href = 'connexion';
    loadAddresses();
    loadSummary();
});

// Récupère les adresses de l'utilisateur
async function loadAddresses() {
    const res = await fetch(`http://localhost:6767/adresses/${user.id}`);
    const addresses = await res.json();
    const container = document.getElementById('address-container');

    if (res.ok && addresses.length > 0) {
        container.innerHTML = addresses.map(addr => `
            <label class="block p-3 border border-gray-700 rounded cursor-pointer hover:bg-[#003254] transition">
                <input type="radio" name="address" value="${addr.id}" onclick="selectedAddressId = ${addr.id}">
                <span class="ml-2">${addr.street}, ${addr.city} (${addr.code_postal})</span>
            </label>
        `).join('');
    } else {
        container.innerHTML = "<p class='text-gray-500'>Aucune adresse enregistrée.</p>";
    }
}

// Ajoute une nouvelle adresse
document.getElementById('add-address-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        user_id: user.id,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        code_postal: document.getElementById('zip').value,
        country: document.getElementById('country').value
    };

    const res = await fetch('http://localhost:6767/adresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        loadAddresses();
        e.target.reset();
    }
});

// Affiche le résumé du panier
// livraison.js
// ... (haut du fichier inchangé)

async function loadSummary() {
    try {
        const res = await fetch(`http://localhost:6767/panier/${user.id}`);
        const items = await res.json();

        console.log("Vérification des clés :", items[0]); // Regarde bien les noms des propriétés ici

        cartItems = items.map(item => {
            // Si l'id du champion arrive sous la clé 'id', on la prend.
            // Sinon on cherche 'champion_id'.
            const cID = item.id || item.champion_id;

            const price = parseFloat(item.price);
            const reduction = parseFloat(item.reduction || 0);
            const unitPrice = reduction > 0 ? Math.floor(price * (1 - reduction / 100)) : price;

            return {
                champion_id: cID,
                skin_id: item.skin_id || null,
                quantite: item.quantite,
                price: unitPrice
            };
        });

        const summary = document.getElementById('summary-items');
        totalAmount = 0;

        if (items.length > 0) {
            summary.innerHTML = items.map(item => {
                const reduction = parseFloat(item.reduction || 0);
                const price = parseFloat(item.price);
                const unitPrice = reduction > 0 ? Math.floor(price * (1 - reduction / 100)) : price;
                const qty = parseInt(item.quantite);

                totalAmount += (unitPrice * qty);

                return `
                    <div class="flex justify-between border-b border-gray-800 py-1">
                        <span>${qty}x ${item.champion_name || 'Article'}</span>
                        <span>${unitPrice * qty} RP</span>
                    </div>`;
            }).join('');

            document.getElementById('final-total').innerText = totalAmount;
        }
    } catch (err) {
        console.error("Erreur résumé :", err);
    }
}

// ... (placeOrder reste identique, elle utilisera maintenant cartItems bien rempli)

// Crée la commande finale
async function placeOrder() {
    if (!selectedAddressId) return alert("Choisissez une adresse !");

    const orderData = {
        user_id: user.id,
        adresse_id: selectedAddressId,
        total: totalAmount,
        items: cartItems
    };
    console.log("Données envoyées au serveur :", orderData);
    const res = await fetch('http://localhost:6767/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    if (res.ok) {
        alert("Paiement validé ! Merci de votre achat.");
        // Redirection vers le profil pour voir l'historique
        window.location.href = 'profil';
    } else {
        alert("Une erreur est survenue lors du paiement.");
    }
}