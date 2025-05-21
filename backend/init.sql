-- Drop existing tables if they exist
DROP TABLE IF EXISTS todos;

-- Create sequence for ID generation
CREATE SEQUENCE IF NOT EXISTS todos_id_seq;

-- Create todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NULL
);

-- Add some sample data
INSERT INTO todos (title, description, completed, created_at, due_date) VALUES
('เสร็จสิ้นการพัฒนา Backend API', 'พัฒนา RESTful API สำหรับแอปพลิเคชัน Todo ด้วย Flask และ PostgreSQL', TRUE, NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days'),
('สร้าง Frontend ด้วย React', 'พัฒนาส่วนติดต่อผู้ใช้โดยใช้ React และ TypeScript', FALSE, NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days'),
('ทำการ Dockerize แอปพลิเคชัน', 'สร้าง Dockerfiles และ docker-compose.yml สำหรับการ deploy', FALSE, NOW() - INTERVAL '2 days', NOW() + INTERVAL '4 days'),
('ติดตั้งระบบ CI/CD', 'ตั้งค่า Jenkins เพื่อทำ continuous integration และ deployment', FALSE, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days'),
('ทดสอบการทำงานร่วมกับ RabbitMQ', 'ทดสอบการส่งข้อความระหว่าง microservices ผ่าน RabbitMQ', FALSE, NOW(), NOW() + INTERVAL '14 days');

-- Create index for faster queries
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_due_date ON todos(due_date);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE todos TO postgres;
GRANT USAGE, SELECT ON SEQUENCE todos_id_seq TO postgres;

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Add updated_at column and trigger (optional)
ALTER TABLE todos ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
CREATE TRIGGER update_todos_modtime
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Log initialization
SELECT 'Todo database initialized successfully.' as "Info";