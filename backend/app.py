from flask import Flask, request, jsonify,Response
from flask_cors import CORS
# from datetime import datetime # ไม่ได้ถูกใช้งานใน snippet นี้ อาจจะใช้ในส่วนอื่น
from models import db, Todo # สันนิษฐานว่า db = SQLAlchemy() อยู่ใน models.py
# from flask_sqlalchemy import SQLAlchemy # อาจจะไม่จำเป็นถ้า SQLAlchemy ไม่ได้ถูกเรียกใช้โดยตรงในไฟล์นี้อีก
import os
from dotenv import load_dotenv
from datetime import datetime
import prometheus_client

# โหลดตัวแปร environment จาก .env
load_dotenv()

app = Flask(__name__)
CORS(app) # เปิดใช้งาน CORS สำหรับทุก routes ใน app

# ตั้งค่า Database URI จาก environment variable
# โค้ดส่วนนี้ถูกต้องสำหรับการแก้ไขปัญหา RuntimeError ที่เคยแจ้ง
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', # พยายามอ่านจาก Environment Variable ก่อน
    'sqlite:///todoapp.db'  # ถ้าไม่มี ให้ใช้ SQLite ชื่อ todoapp.db ใน local
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # ปิดการ track modifications เพื่อประสิทธิภาพ

# เริ่มต้น SQLAlchemy extension กับ Flask app
db.init_app(app) 

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    data = request.json
    
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'])
        except ValueError:
            return jsonify({"error": "Invalid date format for due_date"}), 400
    
    new_todo = Todo(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date
    )
    
    db.session.add(new_todo)
    db.session.commit()
    
    return jsonify(new_todo.to_dict()), 201

@app.route('/api/todos-get', methods=['GET'])
def todo_get():
    todos = Todo.query.all()
    result = [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "completed": t.completed
        } for t in todos
    ]
    return jsonify(result)


@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    print(f"Received request for todo ID: {todo_id}")  # แสดงค่า ID ที่รับมา

    todo = Todo.query.get_or_404(todo_id)

    print(f"Found todo: {todo.to_dict()}")  # แสดงข้อมูล todo ที่หาเจอ

    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": f"Todo with ID {todo_id} has been deleted."}), 200

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    todo.title = data.get('title', todo.title)
    todo.description = data.get('description', todo.description)
    todo.completed = data.get('completed', todo.completed)
    db.session.commit()
    return jsonify({
        "id": todo.id,
        "title": todo.title,
        "description": todo.description,
        "completed": todo.completed
    })

@app.cli.command("init-db")
def init_db_command():
    """Clear existing data and create new tables."""
    db.drop_all()
    db.create_all()
    print("Initialized the database.")
    
@app.cli.command("seed-db")
def seed_db_command():
    """Add sample data to the database."""
    db.session.query(Todo).delete()
    
    sample_todos = [
        Todo(
            title="Complete PostgreSQL backend",
            description="Implement CRUD API for todos with PostgreSQL",
            completed=True
        ),
        Todo(
            title="Build React frontend",
            description="Create a UI for the todo application",
            completed=False
        ),
        Todo(
            title="Implement Dark Mode",
            description="Add dark mode toggle to the frontend",
            completed=False
        )
    ]
    
    for todo in sample_todos:
        db.session.add(todo)
    
    db.session.commit()
    print("Added sample data to the database.")
    
@app.route('/metrics')
def metrics():
    return Response(prometheus_client.generate_latest(), mimetype='text/plain')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
