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
async function loadSummary() {
    try {
        const res = await fetch(`http://localhost:6767/panier/${user.id}`);
        const items = await res.json();
        
        console.log("Articles reçus pour le résumé :", items); // Debugging

        const summary = document.getElementById('summary-items');
        totalAmount = 0;

        if (items.length > 0) {
            summary.innerHTML = items.map(item => {
                // IMPORTANT : Vérifie que item.price est bien un nombre
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantite);
                
                totalAmount += (price * qty);

                // On utilise champion_name (ou displayName si tu as gardé la logique des skins)
                return `<div class="flex justify-between border-b border-gray-800 py-1">
                            <span>${qty}x ${item.champion_name}</span>
                            <span>${price * qty} RP</span>
                        </div>`;
            }).join('');

            document.getElementById('final-total').innerText = totalAmount;
        } else {
            summary.innerHTML = "<p>Votre panier est vide.</p>";
            document.getElementById('final-total').innerText = "0";
        }
    } catch (err) {
        console.error("Erreur résumé commande :", err);
    }
}

// Crée la commande finale
async function placeOrder() {
    if (!selectedAddressId) return alert("Choisissez une adresse !");

    const orderData = {
        user_id: user.id,
        adresse_id: selectedAddressId,
        total: totalAmount,
        items: cartItems 
    };

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