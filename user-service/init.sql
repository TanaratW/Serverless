-- ลบตารางหากมีอยู่แล้ว
DROP TABLE IF EXISTS users;

-- สร้าง sequence ถ้ายังไม่มี
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- สร้างตาราง users ตาม model ที่ให้มา
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO users (username, password) VALUES
('alice', 'alice123'),
('bob', 'bob456'),
('charlie', 'charlie789');

-- สร้างดัชนีเพื่อให้ query เร็วขึ้น
CREATE INDEX idx_users_username ON users(username);

-- กำหนดสิทธิ์ให้ postgres
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;

-- แสดงข้อความ log
SELECT 'User table initialized successfully.' AS "Info";
