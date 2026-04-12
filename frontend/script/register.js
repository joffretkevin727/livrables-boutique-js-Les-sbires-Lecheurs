// register.js
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Récupération des champs (assure-toi que les ID correspondent à ton HTML)
    const name = document.getElementById('name').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation locale
    if (password !== confirmPassword) {
        alert("Les mots de passe ne sont pas identiques !");
        return;
    }

    try {
        // Envoi des données vers ton API (port 6767 d'après ton app.js)
        const response = await fetch('http://localhost:6767/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, lastname, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Compte créé avec succès !");
            window.location.href = "connexion"; 
        } else {
            // Affiche l'erreur renvoyée par le controller (ex: email déjà pris)
            alert("Erreur : " + data.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        alert("Impossible de contacter le serveur.");
    }
});