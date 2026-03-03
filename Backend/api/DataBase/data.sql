CREATE DATABASE champ_commerce;
USE champ_commerce;

CREATE TABLE USERS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL 
);

CREATE TABLE champions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 50,
    reduction DECIMAL(5,2) DEFAULT 0,
    devise VARCHAR(10) DEFAULT 'RP',
    genre ENUM('Masculin','Féminin','Non-binaire','Machine','Entité Cosmique','Yordle','Esprit') NOT NULL,
    image1 VARCHAR(255),
    image2 VARCHAR(255),
    image3 VARCHAR(255)
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

CREATE TABLE skins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    champion_id INT NOT NULL,
    nom VARCHAR(100),
    prix INT NOt NULL,
    FOREIGN KEY (champion_id) REFERENCES champions(id) ON DELETE CASCADE
);