CREATE DATABASE IF NOT EXISTS product_db;

USE product_db;

CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, price, stock)
VALUES
    ('bibit mangga', 60000, 10),
    ('bibit durian', 45000, 25),
    ('bibit anggur', 30000, 15);
