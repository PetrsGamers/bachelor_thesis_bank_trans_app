# Author: Petr Hýbl (xhyblp01@stud.fit.vutbr.cz)
import os
from flask import Flask, render_template, request, url_for, redirect, jsonify
from flask_sqlalchemy import SQLAlchemy
import jsonpickle
from flask_marshmallow import Marshmallow
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from functools import wraps
from static_analyze import tr_static
from template_analyze import KB_analyze, CSOB_analyze, Moneta_analyze, Airbank_analyze, Fio_analyze, UniCredit_analyze
from flask_cors import CORS
from flask_cors import cross_origin
from datetime import datetime

# Create the application instance
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

UPLOAD_FOLDER = 'statements'
ALLOWED_EXTENSIONS = {'xml', 'csv'}
# FOR MARIADB on local host use ://user:password@host:port/dbname
app.config['SQLALCHEMY_DATABASE_URI'] = 'mariadb+mariadbconnector://root:petrs00@127.0.0.1:3306/vvvv'
# Live server database, but on MYSQL
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://doadmin:AVNS_1pwKNp83B6jRv800f11@db-mysql-fra1-27117-do-user-11965733-0.b.db.ondigitalocean.com:25060/defaultdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(os.path.join(app.instance_path, UPLOAD_FOLDER), exist_ok=True)
app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"

db = SQLAlchemy(app)
ma = Marshmallow(app)
jwt = JWTManager(app)

# schema for Transaction entity


class Transaction(db.Model):
    __tablename__ = 'transaction'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(length=100))
    detail = db.Column(db.String(length=100))
    amount = db.Column(db.Integer)
    statement = db.Column(db.Integer, db.ForeignKey(
        'statement.id'), nullable=False)
    other = db.Column(db.String(length=100))

# schema for Statement entity


class Statement(db.Model):
    __tablename__ = 'statement'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(length=256))
    month = db.Column(db.Integer)
    year = db.Column(db.Integer)
    bank = db.Column(db.String(length=100))
    type = db.Column(db.String(length=100))
    income = db.Column(db.Integer)
    spending = db.Column(db.Integer)
    owner = db.Column(db.Integer, db.ForeignKey('uzivatel.id'),
                      nullable=False)
    transactions = db.relationship(
        "Transaction", backref='Statement', cascade="all, delete")

# schema for User entity


class User(db.Model):
    __tablename__ = 'uzivatel'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(length=100))
    password = db.Column(db.String(length=100))
    firstname = db.Column(db.String(length=100))
    lastname = db.Column(db.String(length=100))
    photo = db.Column(db.String(length=100))
    avg_income = db.Column(db.Integer)
    avg_spending = db.Column(db.Integer)
    statements = db.relationship(
        "Statement", backref='User', cascade="all, delete")

# schema for de/serialization


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True

# schema for de/serialization


class StatementSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Statement
        load_instance = True

# schema for de/serialization


class TransactionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Transaction
        load_instance = True

# API endpoint for creating a token via create_access_token


@app.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    try:
        user = User.query.filter_by(email=email).first()
        if user.password != password:
            return 'wrong password', 401
    except:
        return 'email does not exist', 401

    access_token = create_access_token(identity=email)
    response = {"access_token": access_token,
                "user_id": user.id}
    return response

# Function for checking the filename and extensions


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Creating a user


@app.route('/user', methods=['POST'])
def addUser():
    if request.method == 'POST':
        data = request.json
        Email = data.get('email')  # From json get the data
        currentUser = User.query.filter_by(email=Email).first()
        if currentUser is not None:  # email already exist
            output = {
                "msg": "User already exist"}
            return output, 422
        Password = data.get('password')
        Firstname = data.get('firstname')
        Photo = data.get('photo')
        Lastname = data.get('lastname')
        Avg_income = data.get('avg_income')
        Avg_spending = data.get('avg_spending')
        newUser = User(email=Email, password=Password, firstname=Firstname, photo=Photo,
                       lastname=Lastname, avg_income=Avg_income, avg_spending=Avg_spending)
        db.session.add(newUser)
        db.session.commit()
        db.session.refresh(newUser)
        output = {
            "id": newUser.id,
        }
        return jsonify(output), 200

# Logout user


@app.route("/logout", methods=["POST"])
def logout():
    response = {"msg": "logout successful"}
    return response

# Get data from user


@app.route("/user", methods=["GET"])
@jwt_required()
def getUser():
    currentUserEmail = get_jwt_identity()  # find existing token
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'GET':
        userschema = UserSchema()
        output = userschema.dump(currentUser)  # deserialization of data
        return output

# Edit/Delete data from user


@app.route('/user/<user_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def CRUDuser(user_id):
    user = User.query.get_or_404(user_id)
    if request.method == 'GET':
        statement = User.query.filter_by(id=user_id).first()
        userschema = UserSchema()
        output = userschema.dump(statement)
        return output

    if request.method == 'PUT':
        data = request.json
        Email = data.get('email')
        Password = data.get('password')
        Firstname = data.get('firstname')
        Photo = data.get('photo')
        Lastname = data.get('lastname')
        Avg_income = data.get('avg_income')
        Avg_spending = data.get('avg_spending')
        if Email != None:
            user.email = Email
        if Password != None:
            user.password = Password
        if Firstname != None:
            user.firstname = Firstname
        if Photo != None:
            user.photo = Photo
        if Lastname != None:
            user.lastname = Lastname
        if Avg_income != None:
            user.avg_income = Avg_income
        if Avg_spending != None:
            user.avg_spending = Avg_spending
        db.session.add(user)
        db.session.commit()
        return "ok"

    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return 'deleted'


# Add new statement
@app.route('/statement', methods=['POST'])
@jwt_required()
def addStatement():
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'POST':  # CREATE STATEMENT
        if 'file' not in request.files:
            return "bad file", 422
        file = request.files['file']
        if file.filename == '':
            return "no file", 422
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            Month = None
            Year = None
            Bank = None
            Type = None
            Income = None
            Spending = None
            Owner = currentUser.id
            Filename = file.filename
            newStatement = Statement(month=Month, year=Year, bank=Bank, type=Type,
                                     income=Income, spending=Spending, owner=Owner, filename=Filename)
            db.session.add(newStatement)
            db.session.commit()
            db.session.refresh(newStatement)
            output = {
                "id": newStatement.id,
            }
            return jsonify(output), 200

# Get data, edit data and delete statement


@app.route('/statement/<statement_id>', methods=['PUT', 'GET', 'DELETE'])
@jwt_required()
def CRUDStatement(statement_id):
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()

    if request.method == 'GET':
        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, id=statement_id).first()
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        statementschema = StatementSchema()
        output = statementschema.dump(currentStatement)
        return output

    if request.method == 'PUT':  # EDIT STATEMENT
        data = request.json
        try:
            currentStatement = Statement.query.filter_by(
                owner=currentUser.id, id=statement_id).first()
        except:
            return "wrong filename or owner", 401
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        Month = data.get('month')
        Year = data.get('year')
        Bank = data.get('bank')
        Type = data.get('type')
        Income = data.get('income')
        Spending = data.get('spending')
        if Month != None:
            currentStatement.month = Month
        if Year != None:
            currentStatement.year = Year
        if Bank != None:
            currentStatement.bank = Bank
        if Type != None:
            currentStatement.type = Type
        if Income != None:
            currentStatement.income = Income
        if Spending != None:
            currentStatement.spending = Spending
        if (Bank == None) or (Month == None) or (Year == None):
            return "Need year, month and bank type", 401
        db.session.add(currentStatement)
        db.session.commit()
        return "success", 200

    if request.method == 'DELETE':  # DELETE STATEMENT
        try:
            currentStatement = Statement.query.filter_by(
                owner=currentUser.id, id=statement_id).first()
        except:
            return "wrong filename or owner", 401
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        db.session.delete(currentStatement)
        db.session.commit()
        return 'deleted'
    else:
        return "wrong method", 404

# Create a transaction


@app.route('/transaction/', methods=['POST'])
@jwt_required()
def addTransaction():
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'POST':  # CREATE TRANSACTION
        data = request.json

        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, id=data.get('statement')).first()  # Check if the statement exist

        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        Category = data.get('category')
        Detail = data.get('detail')
        Amount = data.get('amount')
        newTransaction = Transaction(
            category=Category, detail=Detail, amount=Amount, statement=currentStatement.id)
        db.session.add(newTransaction)
        db.session.commit()
        db.session.refresh(newTransaction)
        output = {
            "id": newTransaction.id,
        }
        return jsonify(output), 200

# GEt id, and all data from latest statement


@app.route('/lateststatement', methods=['GET'])
@jwt_required()
def latestStatement():
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'GET':
        currentMonth = datetime.now().month - 1
        currentYear = datetime.now().year
        if (currentMonth == 0):
            currentMonth = 12
            currentYear = currentYear-1
        print(str(currentYear) + "  " + str(currentMonth))
        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, month=currentMonth, year=currentYear).first()
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        statementschema = StatementSchema()
        output = statementschema.dump(currentStatement)
        return output

# GET all transaction from statement


@app.route('/statement/<statement_id>/transactions', methods=['GET'])
@jwt_required()
def allStatementTransaction(statement_id):
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'GET':
        currentStatement = Statement.query.filter_by(id=statement_id).first()
        if currentStatement is None:
            return "wrong statement", 401
        all_transaction = Transaction.query.filter_by(
            statement=currentStatement.id).all()
        transactions = []
        for tra in all_transaction:
            print(tra)
            transactionSchema = TransactionSchema()
            output = transactionSchema.dump(tra)
            transactions.append(output)
        print(transactions)
        return transactions, 200

# get all statements created by user


@app.route('/allstatements/', methods=['GET'])
@jwt_required()
@cross_origin()
def allStatements():
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    all_statements = Statement.query.filter_by(owner=currentUser.id).all()
    if all_statements is None:
        return "wrong statement", 401
    statements = []
    for sta in all_statements:
        print(sta)
        statetemntschema = StatementSchema()
        output = statetemntschema.dump(sta)
        statements.append(output)
    print(statements)
    return statements, 200

# GET, edit and delete data from transaction.


@app.route('/transaction/<trans_id>', methods=['PUT', 'GET', 'DELETE'])
@jwt_required()
def CRUDTransaction(trans_id):
    currentUserEmail = get_jwt_identity()
    currentUser = User.query.filter_by(email=currentUserEmail).first()
    if request.method == 'GET':
        currentTransaction = Transaction.query.filter_by(id=trans_id).first()
        if currentTransaction is None:
            return "wrong transaction", 401
        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, id=currentTransaction.statement).first()
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        transactionSchema = TransactionSchema()
        output = transactionSchema.dump(currentTransaction)
        return output
    if request.method == 'PUT':  # EDIT TRANSACTION
        data = request.json
        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, id=data.get('statement')).first()
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        currentTransaction = Transaction.query.filter_by(
            statement=currentStatement.id, id=trans_id).first()
        if currentTransaction is None:
            return "wrong transaction or statement", 401
        Category = data.get('category')
        Detail = data.get('detail')
        Amount = data.get('amount')
        if Category != None:
            currentTransaction.category = Category
        if Detail != None:
            currentTransaction.detail = Detail
        if Amount != None:
            currentTransaction.amount = Amount
        db.session.add(currentTransaction)
        db.session.commit()
        return "success", 200

    if request.method == 'DELETE':  # DELETE STATEMENT
        currentTransaction = Transaction.query.filter_by(id=trans_id).first()
        if currentTransaction is None:
            return "wrong transaction", 401
        currentStatement = Statement.query.filter_by(
            owner=currentUser.id, id=currentTransaction.statement).first()
        if currentStatement is None:
            return "wrong statement or owner", 401
        if currentStatement.owner != currentUser.id:
            return "wrong owner", 401
        if currentTransaction is None:
            return "wrong transaction or statement", 401
        db.session.delete(currentTransaction)
        db.session.commit()
        return 'deleted'
    else:
        return "wrong method", 404

# Start analyse of statement, check bank type and use templates.


@app.route('/analyze/<statement_id>')
def analyzeStatement(statement_id):
    try:
        currentStatement = Statement.query.filter_by(id=statement_id).first()
    except:
        return "wrong filename or owner", 401
    if currentStatement is None:
        return "wrong statement or owner", 401
    tr_list = []
    # try:
    if currentStatement.bank == "Komercni banka":
        tr_list = KB_analyze(currentStatement.filename)
    if currentStatement.bank == "CSOB":
        tr_list = CSOB_analyze(currentStatement.filename)
    if currentStatement.bank == 'Moneta':
        tr_list = Moneta_analyze(currentStatement.filename)
    if currentStatement.bank == 'Airbank':
        tr_list = Airbank_analyze(currentStatement.filename)
    if currentStatement.bank == 'Fio':
        tr_list = Fio_analyze(currentStatement.filename)
    if currentStatement.bank == "UniCredit":
        tr_list = UniCredit_analyze(currentStatement.filename)
    # except:
     #   return "error analyze", 422
    spending = 0
    income = 0
    for transaction in tr_list:
        print(transaction)
        if "-" in transaction.amount:
            tra_temp = transaction.amount
            tra_temp = tra_temp.replace('-', '')
            spending = spending + float(tra_temp)
        else:
            income = income + float(transaction.amount)
        newTransaction = Transaction(
            category=transaction.category, detail=transaction.detail, amount=transaction.amount, statement=currentStatement.id, other=transaction.other)
        db.session.add(newTransaction)
        db.session.commit()
        db.session.refresh(newTransaction)
    currentStatement.spending = spending
    currentStatement.income = income
    db.session.add(currentStatement)
    db.session.commit()
    return "success", 200


@app.route('/')
def home():
    return 'Site works'


app.run(port=5000)
