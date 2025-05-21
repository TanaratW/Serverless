from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from models import db, User  # เปลี่ยนจาก Todo เป็น User
import os
from dotenv import load_dotenv
from datetime import datetime
import prometheus_client

# โหลดตัวแปร environment จาก .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ตั้งค่า Database URI
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todoapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# เริ่มต้น SQLAlchemy
db.init_app(app)

@app.route('/user-service/users', methods=['POST'])
def register_user():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 409

    new_user = User(
        username=data['username'],
        password=data['password']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

@app.route('/user-service/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/user-service/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/user-service/login', methods=['POST'])
def login_user():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data['username']).first()

    if not user or user.password != data['password']:
        return jsonify({"error": "Invalid username or password"}), 401

    # mock token สำหรับตอนนี้ (แนะนำให้ใช้ JWT ในอนาคต)
    token = f"mock-token-{user.id}"

    return jsonify({
        "id": user.id,
        "username": user.username,
        "token": token
    }), 200


@app.cli.command("init-db")
def init_db_command():
    db.drop_all()
    db.create_all()
    print("Initialized the database.")

@app.cli.command("seed-db")
def seed_db_command():
    db.session.query(User).delete()

    sample_users = [
        User(username="alice", password="alice123"),
        User(username="bob", password="bob456"),
        User(username="charlie", password="charlie789")
    ]

    db.session.bulk_save_objects(sample_users)
    db.session.commit()
    print("Added sample users to the database.")

@app.route('/metrics')
def metrics():
    return Response(prometheus_client.generate_latest(), mimetype='text/plain')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5003)