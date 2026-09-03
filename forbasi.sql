-- SQL Database Schema for KEJURCAB LKBB Voting Platform (FORBASI)
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
-- 2. Create Categories Table (SMA, SMP, SD, Purna)
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
-- SEED DATA (DATA AWAL)
-- =========================================================================
-- Insert Categories
INSERT INTO categories (id, nama, deskripsi) VALUES
(1, 'SMA Sederajat', 'Kategori Lomba untuk Pleton tingkat SMA / SMK / MA sederajat'),
(2, 'SMP Sederajat', 'Kategori Lomba untuk Pleton tingkat SMP / MTs sederajat'),
(3, 'SD Sederajat', 'Kategori Lomba untuk Pleton tingkat SD / MI sederajat'),
(4, 'Purna', 'Kategori Lomba untuk Pleton tingkat Purna / Umum');

-- Insert Users (Admins and Voters)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$wN3/CWhrTq/QYI3oG/fVfeS5m7Q15eMpqQhR7g5L4fW5WdC8d8w3q', 'admin'),
(2, 'Pranada Alfath', 'pranadaalfath@gmail.com', '$2b$10$tZ2M9p.Y1NfFhW9R/tY.de7L5QW35vQk3q7fN8x5d4e3w2q1r0s9t', 'voter');

-- Insert Teams (Pleton / Tim Peserta)
INSERT INTO teams (id, no_urut, nama, asal_sekolah, foto_url, category_id) VALUES
-- SMA Sederajat (Category 1)
(1, '01', 'SMA N 1 Tegal', 'SMA N 1 Tegal', 'https://via.placeholder.com/400x400.png?text=SMA+N+1+Tegal', 1),
(2, '02', 'SMA N 3 Tegal', 'SMA N 3 Tegal', 'https://via.placeholder.com/400x400.png?text=SMA+N+3+Tegal', 1),
(3, '03', 'SMA N 4 Tegal', 'SMA N 4 Tegal', 'https://via.placeholder.com/400x400.png?text=SMA+N+4+Tegal', 1),
(4, '04', 'SMA N 5 Tegal Tim A', 'SMA N 5 Tegal', 'https://via.placeholder.com/400x400.png?text=SMA+N+5+Tegal+Tim+A', 1),
(5, '05', 'SMAN 5 Tegal Tim B', 'SMAN 5 Tegal', 'https://via.placeholder.com/400x400.png?text=SMAN+5+Tegal+Tim+B', 1),
(6, '06', 'SMK N 1 Tegal', 'SMK N 1 Tegal', 'https://via.placeholder.com/400x400.png?text=SMK+N+1+Tegal', 1),
-- SMP Sederajat (Category 2)
(7, '01', 'SMP N 2 Tegal', 'SMP N 2 Tegal', 'https://via.placeholder.com/400x400.png?text=SMP+N+2+Tegal', 2),
(8, '02', 'SMP N 5 Tegal', 'SMP N 5 Tegal', 'https://via.placeholder.com/400x400.png?text=SMP+N+5+Tegal', 2),
(9, '03', 'SMP N 7 Tegal', 'SMP N 7 Tegal', 'https://via.placeholder.com/400x400.png?text=SMP+N+7+Tegal', 2),
(10, '04', 'SMP N 10 Tegal', 'SMP N 10 Tegal', 'https://via.placeholder.com/400x400.png?text=SMP+N+10+Tegal', 2),
-- SD Sederajat (Category 3)
(11, '01', 'SD N Mangkukusuman 1', 'SD N Mangkukusuman 1', 'https://via.placeholder.com/400x400.png?text=SD+N+Mangkukusuman+1', 3),
(12, '02', 'SD N Pekauman 2', 'SD N Pekauman 2', 'https://via.placeholder.com/400x400.png?text=SD+N+Pekauman+2', 3),
(13, '03', 'MI Ihsaniyah Tegal', 'MI Ihsaniyah Tegal', 'https://via.placeholder.com/400x400.png?text=MI+Ihsaniyah+Tegal', 3),
-- Purna (Category 4)
(14, '01', 'Purna Paskibraka Kota Tegal', 'Purna Kota Tegal', 'https://via.placeholder.com/400x400.png?text=Purna+Paskibraka+Tegal', 4),
(15, '02', 'Purna Garuda Wira', 'Purna Garuda Wira', 'https://via.placeholder.com/400x400.png?text=Purna+Garuda+Wira', 4);

-- Insert Sample Tickets
INSERT INTO tickets (id, code, status, user_id, used_at) VALUES
(1, 'TICKET-LKBB-AAAA-1111', 'used', 2, '2026-06-21 16:00:00'),
(2, 'TICKET-LKBB-BBBB-2222', 'active', 2, NULL),
(3, 'TICKET-LKBB-CCCC-3333', 'active', NULL, NULL),
(4, 'TICKET-LKBB-DDDD-4444', 'active', NULL, NULL);

-- Insert Sample Votes
INSERT INTO votes (id, user_id, team_id, ticket_id, voted_at) VALUES
(1, 2, 1, 1, '2026-06-21 16:00:00');
