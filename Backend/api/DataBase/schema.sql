CREATE DATABASE champ_commerce;
USE champ_commerce;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL 
);

CREATE TABLE champions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    difficulte ENUM('Facile','Moyen','Difficile') NOT NULL,
    description VARCHAR(500) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 50,
    reduction DECIMAL(5,2) DEFAULT 0,
    devise VARCHAR(10) DEFAULT 'RP',
    genre ENUM('Masculin','Féminin','Autre') NOT NULL,
    espece ENUM('humain','dieu','yordle','mort-vivant','être du néant','être celeste','darkin','demon','esprit','golem','vastaya','transfiguré','manifestation','autre') NOT NULL
    
);

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom ENUM('Assassin','Combattant','Mage','Tireur','Support','Tank') NOT NULL
);

CREATE TABLE champion_roles (
    champion_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (champion_id, role_id),
    FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE champion_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    champion_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    ordre INT DEFAULT 0,
    FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE
);

CREATE TABLE skins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    champion_id INT NOT NULL,
    nom VARCHAR(100),
    prix INT NOT NULL,
    FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE
);

CREATE TABLE icon_avatars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    champion_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prix INT NOT NULL DEFAULT 250,
    FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE
);

CREATE TABLE adresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    code_postal VARCHAR(10),
    country VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE commandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    adresse_id INT NOT NULL,
    statut ENUM('en attente','payée','expédié','livrée') NOT NULL,
    total DECIMAL(10,2),
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (adresse_id) REFERENCES adresses(id)
);

CREATE TABLE commande_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    champion_id INT NOT NULL,
    skin_id INT NULL,
    quantite INT NOT NULL,
    price_unity DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id),
    FOREIGN KEY (champion_id) REFERENCES champions(id),
    FOREIGN KEY (skin_id) REFERENCES skins(id)
);

CREATE TABLE panier (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    champion_id INT NOT NULL,
    skin_id INT NULL,
    icon_avatar_id INT NULL,
    quantite INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (champion_id) REFERENCES champions(id),
    FOREIGN KEY (skin_id) REFERENCES skins(id),
    FOREIGN KEY (icon_avatar_id) REFERENCES icon_avatars(id)
);

CREATE TABLE favoris (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    champion_id INT NOT NULL,
    UNIQUE KEY unique_favori (user_id, champion_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (champion_id) REFERENCES champions(id)
)