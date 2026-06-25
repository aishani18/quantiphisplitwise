from flask import Blueprint, request, jsonify

from database.db import get_db_connection

expenses_bp = Blueprint("expenses", __name__)


@expenses_bp.route("/expenses", methods=["GET"])
def get_expenses():

    conn = get_db_connection()

    expenses = conn.execute(
        "SELECT * FROM expenses"
    ).fetchall()

    conn.close()

    return jsonify([dict(expense) for expense in expenses])


@expenses_bp.route("/expenses", methods=["POST"])
def add_expense():

    data = request.json

    description = data["description"]

    payer = data["payer"]

    splits = data["splits"]

    conn = get_db_connection()

    for split in splits:

        debtor = split["debtor"]

        amount = split["amount"]

        conn.execute(
            """
            INSERT INTO expenses
            (
                description,
                payer,
                debtor,
                amount
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                description,
                payer,
                debtor,
                amount
            )
        )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Expense added successfully"
    })


@expenses_bp.route("/expenses/<int:id>", methods=["DELETE"])
def delete_expense(id):

    conn = get_db_connection()

    conn.execute(
        "DELETE FROM expenses WHERE id = ?",
        (id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "message": "Expense deleted"
    })