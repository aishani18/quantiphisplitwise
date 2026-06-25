CREATE TABLE IF NOT EXISTS expenses (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    description TEXT NOT NULL,

    payer TEXT NOT NULL,

    debtor TEXT NOT NULL,

    amount REAL NOT NULL,

    settled INTEGER DEFAULT 0

);