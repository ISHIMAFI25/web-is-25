-- Database migration untuk tabel countdown_settings
-- File: database/create_countdown_settings_table.sql

CREATE TABLE IF NOT EXISTS countdown_settings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_time TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    show_only_countdown BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_countdown_settings_is_active ON countdown_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_countdown_settings_target_time ON countdown_settings(target_time);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_countdown_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_countdown_settings_updated_at ON countdown_settings;
CREATE TRIGGER update_countdown_settings_updated_at
    BEFORE UPDATE ON countdown_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_countdown_settings_updated_at();

-- Insert data contoh (opsional)
-- INSERT INTO countdown_settings (title, description, target_time, is_active, show_only_countdown)
-- VALUES 
-- ('Pelantikan IS 25', 'Countdown untuk acara pelantikan Intellektuelle Schule 25', '2025-12-31 23:59:59', false, false);