from flask import Blueprint, jsonify

from database.db import get_db_connection

balances_bp = Blueprint("balances", __name__)


@balances_bp.route("/balances", methods=["GET"])
def get_balances():

    conn = get_db_connection()

    expenses = conn.execute(
        """
        SELECT *
        FROM expenses
        WHERE settled = 0
        """
    ).fetchall()

    conn.close()

    net_balances = {}

    for expense in expenses:

        debtor = expense["debtor"]

        creditor = expense["payer"]

        amount = float(expense["amount"])

        if debtor == creditor:
            continue

        if debtor not in net_balances:
            net_balances[debtor] = 0

        if creditor not in net_balances:
            net_balances[creditor] = 0

        net_balances[debtor] -= amount

        net_balances[creditor] += amount

    debtors = []
    creditors = []

    for person, balance in net_balances.items():

        if balance < 0:

            debtors.append({
                "person": person,
                "amount": abs(balance)
            })

        elif balance > 0:

            creditors.append({
                "person": person,
                "amount": balance
            })

    balances = []

    i = 0
    j = 0

    while i < len(debtors) and j < len(creditors):

        debtor = debtors[i]

        creditor = creditors[j]

        settled_amount = min(
            debtor["amount"],
            creditor["amount"]
        )

        balances.append({
            "debtor": debtor["person"],
            "creditor": creditor["person"],
            "amount": round(settled_amount, 2)
        })

        debtor["amount"] -= settled_amount

        creditor["amount"] -= settled_amount

        if debtor["amount"] < 0.01:
            i += 1

        if creditor["amount"] < 0.01:
            j += 1

    return jsonify(balances)