-- Drop existing table if it exists
DROP TABLE IF EXISTS priorities;

-- Create sequence for ID generation
CREATE SEQUENCE IF NOT EXISTS priorities_id_seq;

-- Create priorities table
CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7), -- HEX code เช่น #FF0000
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sample priorities
INSERT INTO priorities (name, color) VALUES
('High', '#FF0000'),
('Medium', '#FFA500'),
('Low', '#00FF00');

-- Create index for faster lookup
CREATE INDEX idx_priorities_name ON priorities(name);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE priorities TO postgres;
GRANT USAGE, SELECT ON SEQUENCE priorities_id_seq TO postgres;

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_priorities_modtime
    BEFORE UPDATE ON priorities
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Log initialization
SELECT 'Priority table initialized successfully.' AS "Info";