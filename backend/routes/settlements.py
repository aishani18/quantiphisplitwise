from flask import Blueprint, jsonify

from database.db import get_db_connection

settlements_bp = Blueprint("settlements", __name__)


@settlements_bp.route("/settle/<int:id>", methods=["PATCH"])
def settle_expense(id):

    conn = get_db_connection()

    conn.execute(
        """
        UPDATE expenses
        SET settled = 1
        WHERE id = ?
        """,
        (id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Expense settled"
    })