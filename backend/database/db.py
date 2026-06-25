import sqlite3

from config import DATABASE_PATH


def get_db_connection():

    conn = sqlite3.connect(DATABASE_PATH)

    conn.row_factory = sqlite3.Row

    return conn


def initialize_database():

    conn = get_db_connection()

    with open("database/schema.sql", "r") as file:

        conn.executescript(file.read())

    conn.commit()

    conn.close()