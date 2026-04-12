// connexion.js
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:6767/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Sauvegarde les infos de l'utilisateur pour les autres pages
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert("Ravi de vous revoir, " + data.user.name + " !");
            window.location.href = "profil"; 
        } else {
            // Affiche l'erreur du controller (ex: Mot de passe incorrect)
            alert(data.message || "Identifiants invalides.");
        }
    } catch (error) {
        console.error("Erreur connexion :", error);
        alert("Le serveur de Poro Corp est injoignable.");
    }
});