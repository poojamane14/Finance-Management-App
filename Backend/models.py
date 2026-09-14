from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)

    # Link transaction to a user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # Transaction information
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    merchant = db.Column(db.String(150))
    transaction_type = db.Column(db.String(20), nullable=False)

    # VaultIQ classification
    category = db.Column(db.String(50))
    subcategory = db.Column(db.String(100))

    # Transaction details
    transaction_date = db.Column(db.DateTime)
    description = db.Column(db.Text)

    # Where the transaction came from
    source = db.Column(db.String(20), nullable=False)

    # AI/ML confidence
    confidence_score = db.Column(db.Float)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    # Relationship with User
    user = db.relationship(
        "User",
        backref=db.backref("transactions", lazy=True)
    )

class FinancialProfile(db.Model):
    __tablename__ = "financial_profiles"

    id = db.Column(db.Integer, primary_key=True)

    # Link financial data to a user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # Financial information
    monthly_income = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    fixed_budget = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    varying_budget = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    savings_goal = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

class MonthlyBudget(db.Model):
    __tablename__ = "monthly_budgets"

    id = db.Column(db.Integer, primary_key=True)

    # Link monthly budget to a user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    # Month and year
    month = db.Column(
        db.Integer,
        nullable=False
    )

    year = db.Column(
        db.Integer,
        nullable=False
    )

    # Monthly financial targets
    fixed_budget = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    varying_budget = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    savings_goal = db.Column(
        db.Numeric(10, 2),
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    # Relationship with User
    user = db.relationship(
        "User",
        backref=db.backref("monthly_budgets", lazy=True)
    )

    # One budget record per user for each month/year
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "month",
            "year",
            name="unique_user_month_year"
        ),
    )