document.addEventListener('DOMContentLoaded', async () => {
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!userData) {
        window.location.href = 'connexion';
        return;
    }

    // Affichage des infos de base
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-lastname').textContent = userData.lastname;
    document.getElementById('user-email').textContent = userData.email;

    // Récupération des adresses
    fetchData(`http://localhost:6767/adresses/${userData.id}`, 'address-list', (data) => {
        return data.map(addr => `<p>📍 ${addr.street}, ${addr.city} (${addr.code_postal})</p>`).join('');
    });

    // Récupération des commandes
    fetchData(`http://localhost:6767/commandes/${userData.id}`, 'orders-list', (data) => {
        return data.map(cmd => `
            <tr class="border-b border-gray-700">
                <td class="py-3">#${cmd.id}</td>
                <td>${new Date(cmd.date_commande).toLocaleDateString()}</td>
                <td>${cmd.total} RP</td>
                <td><span class="bg-blue-900 px-2 py-1 rounded text-xs">${cmd.statut}</span></td>
            </tr>
        `).join('');
    });
});

async function fetchData(url, elementId, formatFn) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        const container = document.getElementById(elementId);
        
        if (res.ok && data.length > 0) {
            container.innerHTML = formatFn(data);
        } else {
            container.innerHTML = "<p class='text-gray-500'>Aucune donnée trouvée.</p>";
        }
    } catch (err) {
        console.error("Erreur de récupération:", err);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'connexion';
}