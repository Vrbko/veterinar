-- Table for system users (vets, owners, admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vet', 'owner') NOT NULL,
    active ENUM('yes', 'no') NOT NULL
);

-- Table for pet owners
CREATE TABLE owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    emso CHAR(13) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table for animals
CREATE TABLE animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- owner_id je torej user->id
    nickname VARCHAR(30),
    microchip_number VARCHAR(50),
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    gender VARCHAR(10),
    birth_date DATE,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table for vaccinations
CREATE TABLE vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vaccine_type VARCHAR(100) NOT NULL,
    vaccine_name VARCHAR(100),
    vaccination_date DATE NOT NULL,
    valid_until DATE,
    FOREIGN KEY (animal_id) REFERENCES animals(id)
);



/*
-- Create sample owners
INSERT INTO owners (user_id, first_name, last_name, emso, birth_date, email, phone, address) VALUES
(1,'John', 'Doe', '1234567890123', '1980-05-15', 'john.doe@example.com', '+123456789', '123 Elm Street'),
(2,'Jane', 'Smith', '9876543210987', '1990-08-22', 'jane.smith@example.com', '+987654321', '456 Oak Avenue');

-- Create sample animals
INSERT INTO animals (owner_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight) VALUES
(1, 'Buddy', 'MC12345', 'Dog', 'Golden Retriever', 'Male', '2018-03-10', 60.5, 30.2),
(2, 'Whiskers', 'MC67890', 'Cat', 'Siamese', 'Female', '2020-07-12', 25.0, 4.5);

-- Create sample vaccinations
INSERT INTO vaccinations (animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until) VALUES
(1, 'Rabies', 'Rabvac-3', '2023-01-10', '2026-01-10'),
(2, 'FVRCP', 'Purevax', '2023-02-15', '2024-02-15');
*/
