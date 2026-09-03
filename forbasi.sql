-- SQL Database Schema for KEJURDA LKBB Voting Platform (FORBASI)
-- Compatible with PostgreSQL and MySQL
-- 1. Create Users Table (Admins & Voters)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Hashed passwords
    role VARCHAR(20) NOT NULL DEFAULT 'voter', -- 'admin' or 'voter'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. Create Categories Table (U16, U13, U19, Purna)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3. Create Teams Table (Pleton / Tim Peserta)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    no_urut VARCHAR(10) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    asal_sekolah VARCHAR(150) NOT NULL,
    foto_url VARCHAR(255) DEFAULT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
-- 4. Create Tickets Table (For keeping votes fair)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' or 'used'
    user_id INT DEFAULT NULL, -- Claimed by this user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
-- 5. Create Votes Table (Tracks individual ballot cast)
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    ticket_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- =========================================================================
-- SEED DATA (DATA AWAL KEJURDA)
-- =========================================================================
-- Insert Categories
INSERT INTO categories (id, nama, deskripsi) VALUES
(1, 'U16', 'Kategori Lomba untuk Pleton Usia U16'),
(2, 'U13', 'Kategori Lomba untuk Pleton Usia U13'),
(3, 'U19', 'Kategori Lomba untuk Pleton Usia U19'),
(4, 'Purna', 'Kategori Lomba untuk Pleton Purna / Umum');

-- Insert Users (Admins and Voters)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$wN3/CWhrTq/QYI3oG/fVfeS5m7Q15eMpqQhR7g5L4fW5WdC8d8w3q', 'admin'),
(2, 'Pranada Alfath', 'pranadaalfath@gmail.com', '$2b$10$tZ2M9p.Y1NfFhW9R/tY.de7L5QW35vQk3q7fN8x5d4e3w2q1r0s9t', 'voter');

-- Insert Teams (Pleton Peserta KEJURDA)
INSERT INTO teams (id, no_urut, nama, asal_sekolah, foto_url, category_id) VALUES
-- U16 (Category 1)
(1, '18', 'Klaten', 'Klaten', 'https://via.placeholder.com/400x400.png?text=Klaten', 1),
(2, '08', 'Batang', 'Batang', 'https://via.placeholder.com/400x400.png?text=Batang', 1),
(3, '03', 'Jepara', 'Jepara', 'https://via.placeholder.com/400x400.png?text=Jepara', 1),
(4, '06', 'Banyumas', 'Banyumas', 'https://via.placeholder.com/400x400.png?text=Banyumas', 1),
(5, '23', 'Sukoharjo', 'Sukoharjo', 'https://via.placeholder.com/400x400.png?text=Sukoharjo', 1),
(6, '05', 'Karanganyar', 'Karanganyar', 'https://via.placeholder.com/400x400.png?text=Karanganyar', 1),
(7, '16', 'Cilacap', 'Cilacap', 'https://via.placeholder.com/400x400.png?text=Cilacap', 1),
(8, '21', 'Kota Pekalongan B', 'Kota Pekalongan B', 'https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+B', 1),
(9, '04', 'Kota Pekalongan A', 'Kota Pekalongan A', 'https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+A', 1),
(10, '15', 'Grobogan', 'Grobogan', 'https://via.placeholder.com/400x400.png?text=Grobogan', 1),
(11, '01', 'Kota Semarang', 'Kota Semarang', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang', 1),
(12, '19', 'Sragen', 'Sragen', 'https://via.placeholder.com/400x400.png?text=Sragen', 1),
(13, '24', 'Pekalongan B', 'Pekalongan B', 'https://via.placeholder.com/400x400.png?text=Pekalongan+B', 1),
(14, '14', 'Pekalongan A', 'Pekalongan A', 'https://via.placeholder.com/400x400.png?text=Pekalongan+A', 1),
(15, '12', 'Tegal B', 'Tegal B', 'https://via.placeholder.com/400x400.png?text=Tegal+B', 1),
(16, '13', 'Tegal A', 'Tegal A', 'https://via.placeholder.com/400x400.png?text=Tegal+A', 1),
(17, '20', 'Kota Tegal C', 'Kota Tegal C', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+C', 1),
(18, '10', 'Kota Tegal B', 'Kota Tegal B', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+B', 1),
(19, '25', 'Kota Tegal A', 'Kota Tegal A', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+A', 1),
(20, '17', 'Surakarta', 'Surakarta', 'https://via.placeholder.com/400x400.png?text=Surakarta', 1),
(21, '09', 'Demak', 'Demak', 'https://via.placeholder.com/400x400.png?text=Demak', 1),
(22, '07', 'Semarang', 'Semarang', 'https://via.placeholder.com/400x400.png?text=Semarang', 1),
(23, '02', 'Pemalang', 'Pemalang', 'https://via.placeholder.com/400x400.png?text=Pemalang', 1),
(24, '11', 'Brebes B', 'Brebes B', 'https://via.placeholder.com/400x400.png?text=Brebes+B', 1),
(25, '22', 'Brebes A', 'Brebes A', 'https://via.placeholder.com/400x400.png?text=Brebes+A', 1),

-- U13 (Category 2)
(26, '07', 'Jepara', 'Jepara', 'https://via.placeholder.com/400x400.png?text=Jepara', 2),
(27, '10', 'Karanganyar', 'Karanganyar', 'https://via.placeholder.com/400x400.png?text=Karanganyar', 2),
(28, '06', 'Cilacap', 'Cilacap', 'https://via.placeholder.com/400x400.png?text=Cilacap', 2),
(29, '08', 'Grobogan', 'Grobogan', 'https://via.placeholder.com/400x400.png?text=Grobogan', 2),
(30, '09', 'Kota Semarang', 'Kota Semarang', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang', 2),
(31, '03', 'Sragen', 'Sragen', 'https://via.placeholder.com/400x400.png?text=Sragen', 2),
(32, '01', 'Tegal B', 'Tegal B', 'https://via.placeholder.com/400x400.png?text=Tegal+B', 2),
(33, '02', 'Tegal A', 'Tegal A', 'https://via.placeholder.com/400x400.png?text=Tegal+A', 2),
(34, '11', 'Surakarta', 'Surakarta', 'https://via.placeholder.com/400x400.png?text=Surakarta', 2),
(35, '05', 'Brebes B', 'Brebes B', 'https://via.placeholder.com/400x400.png?text=Brebes+B', 2),
(36, '04', 'Brebes A', 'Brebes A', 'https://via.placeholder.com/400x400.png?text=Brebes+A', 2),

-- U19 (Category 3)
(37, '08', 'Klaten', 'Klaten', 'https://via.placeholder.com/400x400.png?text=Klaten', 3),
(38, '14', 'Batang B', 'Batang B', 'https://via.placeholder.com/400x400.png?text=Batang+B', 3),
(39, '25', 'Batang A', 'Batang A', 'https://via.placeholder.com/400x400.png?text=Batang+A', 3),
(40, '13', 'Jepara', 'Jepara', 'https://via.placeholder.com/400x400.png?text=Jepara', 3),
(41, '03', 'Banyumas', 'Banyumas', 'https://via.placeholder.com/400x400.png?text=Banyumas', 3),
(42, '27', 'Sukoharjo', 'Sukoharjo', 'https://via.placeholder.com/400x400.png?text=Sukoharjo', 3),
(43, '23', 'Karanganyar', 'Karanganyar', 'https://via.placeholder.com/400x400.png?text=Karanganyar', 3),
(44, '24', 'Cilacap', 'Cilacap', 'https://via.placeholder.com/400x400.png?text=Cilacap', 3),
(45, '22', 'Kota Pekalongan B', 'Kota Pekalongan B', 'https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+B', 3),
(46, '26', 'Kota Pekalongan A', 'Kota Pekalongan A', 'https://via.placeholder.com/400x400.png?text=Kota+Pekalongan+A', 3),
(47, '07', 'Grobogan', 'Grobogan', 'https://via.placeholder.com/400x400.png?text=Grobogan', 3),
(48, '06', 'Kota Semarang', 'Kota Semarang', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang', 3),
(49, '04', 'Sragen', 'Sragen', 'https://via.placeholder.com/400x400.png?text=Sragen', 3),
(50, '05', 'Pekalongan B', 'Pekalongan B', 'https://via.placeholder.com/400x400.png?text=Pekalongan+B', 3),
(51, '21', 'Pekalongan A', 'Pekalongan A', 'https://via.placeholder.com/400x400.png?text=Pekalongan+A', 3),
(52, '17', 'Tegal B', 'Tegal B', 'https://via.placeholder.com/400x400.png?text=Tegal+B', 3),
(53, '11', 'Tegal A', 'Tegal A', 'https://via.placeholder.com/400x400.png?text=Tegal+A', 3),
(54, '09', 'Kota Tegal C', 'Kota Tegal C', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+C', 3),
(55, '12', 'Kota Tegal B', 'Kota Tegal B', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+B', 3),
(56, '18', 'Kota Tegal A', 'Kota Tegal A', 'https://via.placeholder.com/400x400.png?text=Kota+Tegal+A', 3),
(57, '15', 'Surakarta', 'Surakarta', 'https://via.placeholder.com/400x400.png?text=Surakarta', 3),
(58, '10', 'Demak', 'Demak', 'https://via.placeholder.com/400x400.png?text=Demak', 3),
(59, '02', 'Semarang', 'Semarang', 'https://via.placeholder.com/400x400.png?text=Semarang', 3),
(60, '16', 'Pemalang B', 'Pemalang B', 'https://via.placeholder.com/400x400.png?text=Pemalang+B', 3),
(61, '20', 'Pemalang A', 'Pemalang A', 'https://via.placeholder.com/400x400.png?text=Pemalang+A', 3),
(62, '19', 'Brebes B', 'Brebes B', 'https://via.placeholder.com/400x400.png?text=Brebes+B', 3),
(63, '01', 'Brebes A', 'Brebes A', 'https://via.placeholder.com/400x400.png?text=Brebes+A', 3),

-- Purna (Category 4)
(64, '06', 'Grobogan C', 'Grobogan C', 'https://via.placeholder.com/400x400.png?text=Grobogan+C', 4),
(65, '04', 'Grobogan B', 'Grobogan B', 'https://via.placeholder.com/400x400.png?text=Grobogan+B', 4),
(66, '05', 'Grobogan A', 'Grobogan A', 'https://via.placeholder.com/400x400.png?text=Grobogan+A', 4),
(67, '10', 'Kota Semarang C', 'Kota Semarang C', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang+C', 4),
(68, '08', 'Kota Semarang B', 'Kota Semarang B', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang+B', 4),
(69, '01', 'Kota Semarang A', 'Kota Semarang A', 'https://via.placeholder.com/400x400.png?text=Kota+Semarang+A', 4),
(70, '02', 'Surakarta', 'Surakarta', 'https://via.placeholder.com/400x400.png?text=Surakarta', 4),
(71, '09', 'Demak C', 'Demak C', 'https://via.placeholder.com/400x400.png?text=Demak+C', 4),
(72, '07', 'Demak B', 'Demak B', 'https://via.placeholder.com/400x400.png?text=Demak+B', 4),
(73, '03', 'Demak A', 'Demak A', 'https://via.placeholder.com/400x400.png?text=Demak+A', 4);

-- Insert Sample Tickets
INSERT INTO tickets (id, code, status, user_id, used_at) VALUES
(1, 'TICKET-LKBB-AAAA-1111', 'used', 2, '2026-06-21 16:00:00'),
(2, 'TICKET-LKBB-BBBB-2222', 'active', 2, NULL),
(3, 'TICKET-LKBB-CCCC-3333', 'active', NULL, NULL),
(4, 'TICKET-LKBB-DDDD-4444', 'active', NULL, NULL);

-- Insert Sample Votes
INSERT INTO votes (id, user_id, team_id, ticket_id, voted_at) VALUES
(1, 2, 1, 1, '2026-06-21 16:00:00');
