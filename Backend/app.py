from flask import Flask, request, jsonify
from extensions import db
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()
password = quote_plus(os.getenv("DB_PASSWORD"))

app = Flask(__name__)

# MySQL database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:"
    f"{password}@"
    f"{os.getenv('DB_HOST')}/"
    f"{os.getenv('DB_NAME')}"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Initialize database

@app.route("/")
def home():
    try:
        db.session.execute(db.text("SELECT 1"))
        return "VaultIQ Backend + MySQL connected successfully!"
    except Exception as e:
        return f"Database connection failed: {e}"

@app.route("/api/transactions", methods=["POST"])
def add_transaction():

    from models import Transaction
    
    try:
        data = request.get_json()

        transaction = Transaction(
            user_id=data["user_id"],
            amount=data["amount"],
            merchant=data.get("merchant"),
            transaction_type=data["transaction_type"],
            category=data.get("category"),
            subcategory=data.get("subcategory"),
            description=data.get("description"),
            source=data["source"],
            confidence_score=data.get("confidence_score")
        )

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "message": "Transaction added successfully!",
            "transaction_id": transaction.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": str(e)
        }), 400

if __name__ == "__main__":
    app.run(debug=True)