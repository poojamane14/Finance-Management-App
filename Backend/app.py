from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()
password = quote_plus(os.getenv("DB_PASSWORD"))

app = Flask(__name__)

CORS(app)

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

@app.route("/api/register", methods=["POST"])
def register():

    from models import User

    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        # Check required fields
        if not name or not email or not password:
            return jsonify({
                "error": "All fields are required"
            }), 400

        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            return jsonify({
                "error": "Email already registered"
            }), 409

        # Hash password
        hashed_password = generate_password_hash(password)

        # Create user
        user = User(
            name=name,
            email=email,
            password_hash=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "Registration successful!",
            "user_id": user.id
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/login", methods=["POST"])
def login():

    from models import User

    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        # Check required fields
        if not email or not password:
            return jsonify({
                "error": "Email and password are required"
            }), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        # Verify password
        if not check_password_hash(user.password_hash, password):
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        # Login successful
        return jsonify({
            "message": "Login successful!",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400 

@app.route("/api/fixed-expenses", methods=["POST"])
def add_fixed_expense():

    from models import Transaction

    try:
        data = request.get_json()

        user_id = data.get("user_id")
        amount = data.get("amount")
        merchant = data.get("merchant")
        description = data.get("description")

        # Check required fields
        if not user_id or not amount or not merchant:
            return jsonify({
                "error": "User ID, amount and merchant are required"
            }), 400

        # Create fixed expense
        transaction = Transaction(
            user_id=user_id,
            amount=amount,
            merchant=merchant,
            transaction_type="expense",
            category="Fixed",
            subcategory=None,
            description=description,
            source="manual"
        )

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "message": "Fixed expense added successfully!",
            "transaction_id": transaction.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400    

@app.route("/api/fixed-expenses/<int:user_id>", methods=["GET"])
def get_fixed_expenses(user_id):

    from models import Transaction

    try:
        expenses = Transaction.query.filter_by(
            user_id=user_id,
            category="Fixed",
            transaction_type="expense"
        ).order_by(
            Transaction.id.desc()
        ).all()

        result = []

        for expense in expenses:
            result.append({
                "id": expense.id,
                "amount": float(expense.amount),
                "merchant": expense.merchant,
                "description": expense.description,
                "category": expense.category,
                "transaction_type": expense.transaction_type,
                "source": expense.source
            })

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/dashboard/<int:user_id>", methods=["GET"])
def get_dashboard_data(user_id):

    from models import Transaction

    try:
        transactions = Transaction.query.filter_by(
            user_id=user_id
        ).all()

        fixed_expenses = []
        varying_expenses = []
        savings = []

        for transaction in transactions:

            transaction_data = {
                "id": transaction.id,
                "amount": float(transaction.amount),
                "merchant": transaction.merchant,
                "description": transaction.description,
                "category": transaction.category,
                "transaction_type": transaction.transaction_type,
                "source": transaction.source
            }

            if transaction.category == "Fixed":
                fixed_expenses.append(transaction_data)

            elif transaction.category == "Variable":
                varying_expenses.append(transaction_data)

            elif transaction.category == "Savings":
                savings.append(transaction_data)

        total_fixed_spent = sum(
            expense["amount"]
            for expense in fixed_expenses
        )

        total_varying_spent = sum(
            expense["amount"]
            for expense in varying_expenses
        )

        total_saved = sum(
            saving["amount"]
            for saving in savings
        )

        return jsonify({
            "user_id": user_id,
            "fixed_expenses": fixed_expenses,
            "varying_expenses": varying_expenses,
            "savings": savings,
            "total_fixed_spent": total_fixed_spent,
            "total_varying_spent": total_varying_spent,
            "total_saved": total_saved
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400

if __name__ == "__main__":
    app.run(debug=True)