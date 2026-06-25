from flask import Flask

from flask_cors import CORS

from database.db import initialize_database

from routes.expenses import expenses_bp

from routes.balances import balances_bp

from routes.settlements import settlements_bp

app = Flask(__name__)

CORS(app)

initialize_database()

app.register_blueprint(expenses_bp)

app.register_blueprint(balances_bp)

app.register_blueprint(settlements_bp)

if __name__ == "__main__":

    app.run(debug=True)