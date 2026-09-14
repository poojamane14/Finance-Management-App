from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from dotenv import load_dotenv
from datetime import datetime
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

@app.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    from models import User

    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    from models import User

    try:
        data = request.get_json()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        name = data.get("name")
        email = data.get("email")

        if not name or not email:
            return jsonify({
                "error": "Name and email are required"
            }), 400

        # Check if another user already has this email
        existing_user = User.query.filter(
            User.email == email,
            User.id != user_id
        ).first()

        if existing_user:
            return jsonify({
                "error": "Email is already registered"
            }), 400

        user.name = name
        user.email = email

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully!",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

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
    transaction_date=datetime.utcnow(),
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
    "transaction_date": (
        expense.transaction_date.isoformat()
        if expense.transaction_date
        else (
            expense.created_at.isoformat()
            if expense.created_at
            else None
        )
    ),
    "created_at": (
        expense.created_at.isoformat()
        if expense.created_at
        else None
    ),
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

@app.route("/api/financial-profile/<int:user_id>", methods=["GET"])
def get_financial_profile(user_id):

    from models import FinancialProfile

    try:
        profile = FinancialProfile.query.filter_by(
            user_id=user_id
        ).first()

        # If profile doesn't exist, create one
        if not profile:
            profile = FinancialProfile(
                user_id=user_id,
                monthly_income=0,
                fixed_budget=0,
                varying_budget=0,
                savings_goal=0
            )

            db.session.add(profile)
            db.session.commit()

        return jsonify({
            "user_id": profile.user_id,
            "monthly_income": float(profile.monthly_income),
            "fixed_budget": float(profile.fixed_budget),
            "varying_budget": float(profile.varying_budget),
            "savings_goal": float(profile.savings_goal)
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/financial-profile", methods=["POST"])
def save_financial_profile():

    from models import FinancialProfile

    try:

        data = request.get_json()

        user_id = data.get("user_id")

        if not user_id:
            return jsonify({
                "error": "User ID is required"
            }), 400

        profile = FinancialProfile.query.filter_by(
            user_id=user_id
        ).first()

        # Create profile if it doesn't exist
        if not profile:

            profile = FinancialProfile(
                user_id=user_id,
                monthly_income=data.get("monthly_income", 0),
                fixed_budget=data.get("fixed_budget", 0),
                varying_budget=data.get("varying_budget", 0),
                savings_goal=data.get("savings_goal", 0)
            )

            db.session.add(profile)

        # Update only the fields sent by frontend
        else:

            if "monthly_income" in data:
                profile.monthly_income = data["monthly_income"]

            if "fixed_budget" in data:
                profile.fixed_budget = data["fixed_budget"]

            if "varying_budget" in data:
                profile.varying_budget = data["varying_budget"]

            if "savings_goal" in data:
                profile.savings_goal = data["savings_goal"]

        db.session.commit()

        return jsonify({
            "message": "Financial profile saved successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/monthly-budget", methods=["POST"])
def save_monthly_budget():

    from models import MonthlyBudget

    try:
        data = request.get_json()

        user_id = data.get("user_id")
        month = data.get("month")
        year = data.get("year")

        fixed_budget = data.get("fixed_budget")
        varying_budget = data.get("varying_budget")
        savings_goal = data.get("savings_goal")

        # Check required fields
        if not user_id or not month or not year:
            return jsonify({
                "error": "User ID, month and year are required"
            }), 400

        # Check whether budget already exists
        budget = MonthlyBudget.query.filter_by(
            user_id=user_id,
            month=month,
            year=year
        ).first()

        # Create new monthly budget
        if not budget:
            budget = MonthlyBudget(
                user_id=user_id,
                month=month,
                year=year,
                fixed_budget=fixed_budget or 0,
                varying_budget=varying_budget or 0,
                savings_goal=savings_goal or 0
            )

            db.session.add(budget)

        # Update only the value that was provided
        else:

            if fixed_budget is not None:
                budget.fixed_budget = fixed_budget

            if varying_budget is not None:
                budget.varying_budget = varying_budget

            if savings_goal is not None:
                budget.savings_goal = savings_goal

        db.session.commit()

        return jsonify({
            "message": "Monthly budget saved successfully!",
            "budget_id": budget.id
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/monthly-budget/<int:user_id>/<int:year>/<int:month>", methods=["GET"])
def get_monthly_budget(user_id, year, month):

    from models import MonthlyBudget

    try:

        budget = MonthlyBudget.query.filter_by(
            user_id=user_id,
            year=year,
            month=month
        ).first()

        # No budget saved for this month
        if not budget:
            return jsonify({
                "user_id": user_id,
                "month": month,
                "year": year,
                "fixed_budget": 0,
                "varying_budget": 0,
                "savings_goal": 0
            }), 200

        return jsonify({
            "user_id": budget.user_id,
            "month": budget.month,
            "year": budget.year,
            "fixed_budget": float(budget.fixed_budget),
            "varying_budget": float(budget.varying_budget),
            "savings_goal": float(budget.savings_goal)
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/fixed-expenses/<int:transaction_id>", methods=["DELETE"])
def delete_fixed_expense(transaction_id):

    from models import Transaction

    try:

        transaction = Transaction.query.filter_by(
            id=transaction_id,
            category="Fixed",
            transaction_type="expense"
        ).first()

        if not transaction:
            return jsonify({
                "error": "Fixed expense not found"
            }), 404

        db.session.delete(transaction)
        db.session.commit()

        return jsonify({
            "message": "Fixed expense deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/varying-expenses", methods=["POST"])
def add_varying_expense():

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

        # Create varying expense
        transaction = Transaction(
            user_id=user_id,
            amount=amount,
            merchant=merchant,
            transaction_type="expense",
            category="Variable",
            subcategory=None,
            description=description,
            transaction_date=datetime.utcnow(),
            source="manual"
        )

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "message": "Varying expense added successfully!",
            "transaction_id": transaction.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400


@app.route("/api/varying-expenses/<int:user_id>", methods=["GET"])
def get_varying_expenses(user_id):

    from models import Transaction

    try:

        expenses = Transaction.query.filter_by(
            user_id=user_id,
            category="Variable",
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
    "transaction_date": (
        expense.transaction_date.isoformat()
        if expense.transaction_date
        else (
            expense.created_at.isoformat()
            if expense.created_at
            else None
        )
    ),
    "source": expense.source
})

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400


@app.route("/api/varying-expenses/<int:transaction_id>", methods=["DELETE"])
def delete_varying_expense(transaction_id):

    from models import Transaction

    try:

        transaction = Transaction.query.filter_by(
            id=transaction_id,
            category="Variable",
            transaction_type="expense"
        ).first()

        if not transaction:

            return jsonify({
                "error": "Varying expense not found"
            }), 404

        db.session.delete(transaction)
        db.session.commit()

        return jsonify({
            "message": "Varying expense deleted successfully!"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

@app.route("/api/savings", methods=["POST"])
def add_saving():

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
                "error": "User ID, amount and saving source are required"
            }), 400

        # Create saving
        transaction = Transaction(
            user_id=user_id,
            amount=amount,
            merchant=merchant,
            transaction_type="income",
            category="Savings",
            subcategory=None,
            description=description,
            transaction_date=datetime.utcnow(),
            source="manual"
        )

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "message": "Saving added successfully!",
            "transaction_id": transaction.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400


@app.route("/api/savings/<int:user_id>", methods=["GET"])
def get_savings(user_id):

    from models import Transaction

    try:

        savings = Transaction.query.filter_by(
            user_id=user_id,
            category="Savings"
        ).order_by(
            Transaction.id.desc()
        ).all()

        result = []

        for saving in savings:

            result.append({
                "id": saving.id,
                "amount": float(saving.amount),
                "merchant": saving.merchant,
                "description": saving.description,
                "category": saving.category,
                "transaction_type": saving.transaction_type,
                "transaction_date": (
                    saving.transaction_date.isoformat()
                    if saving.transaction_date
                    else (
                        saving.created_at.isoformat()
                        if saving.created_at
                        else None
                    )
                ),
                "source": saving.source
            })

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 400


@app.route("/api/savings/<int:transaction_id>", methods=["DELETE"])
def delete_saving(transaction_id):

    from models import Transaction

    try:

        transaction = Transaction.query.filter_by(
            id=transaction_id,
            category="Savings"
        ).first()

        if not transaction:

            return jsonify({
                "error": "Saving not found"
            }), 404

        db.session.delete(transaction)
        db.session.commit()

        return jsonify({
            "message": "Saving deleted successfully!"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 400

if __name__ == "__main__":
    app.run(debug=True)