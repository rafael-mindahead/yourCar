CREATE DATABASE IF NOT EXISTS yourcar_db;
USE yourcar_db;

CREATE TABLE IF NOT EXISTS car_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS car_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    additional_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    pneu_option_id INT NOT NULL,
    banco_option_id INT NOT NULL,
    cor_option_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    gemini_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES car_models(id),
    FOREIGN KEY (pneu_option_id) REFERENCES car_options(id),
    FOREIGN KEY (banco_option_id) REFERENCES car_options(id),
    FOREIGN KEY (cor_option_id) REFERENCES car_options(id)
);

-- Seed car_models
INSERT INTO car_models (name, base_price) VALUES
('Porsche 911 Carrera', 600000.00),
('BMW M4 Competition', 450000.00),
('Audi RS6 Avant', 550000.00);

-- Seed car_options
INSERT INTO car_options (category, name, additional_price) VALUES
('pneu', 'Rodas Esportivas 19"', 15000.00),
('pneu', 'Rodas Carbono Forjado 20"', 35000.00),
('banco', 'Alcantara Black', 12000.00),
('banco', 'Couro Nappa Terracota', 20000.00),
('cor_carro', 'Cinza Nardo', 8000.00),
('cor_carro', 'Azul Portimão', 10000.00),
('cor_carro', 'Preto Obsidian', 6000.00);
