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

INSERT INTO Entries (time, feedingAmount, sensor, glucometerReading, drip, nutritionType, extra) 
VALUES 
('2025-11-28T10:00', 120, 80, 95, 0, 'Milk', 'Morning feed'),
('2025-11-28T14:30', 90, 110, 105, 5, 'Formula', 'Afternoon feed');
