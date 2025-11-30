CREATE TABLE IF NOT EXISTS Entries (
    id INTEGER PRIMARY KEY,
    time TEXT NOT NULL,
    feedingAmount INTEGER,
    sensor INTEGER,
    glucometerReading INTEGER,
    drip INTEGER,
    nutritionType TEXT,
    extra TEXT
);

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

INSERT OR IGNORE INTO Users (username, password) VALUES ('admin', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');

INSERT INTO Entries (time, feedingAmount, sensor, glucometerReading, drip, nutritionType, extra) 
VALUES 
('2025-11-28T10:00', 120, 80, 95, 0, 'Milk', 'Morning feed'),
('2025-11-28T14:30', 90, 110, 105, 5, 'Formula', 'Afternoon feed');
