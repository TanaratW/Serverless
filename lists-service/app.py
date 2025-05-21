from flask import Flask,jsonify,Response
from flask.cli import with_appcontext
import prometheus_client
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.models import Todo, db

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todoapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# **ไม่ต้องสร้าง db ใหม่ในนี้** เพราะสร้างใน models.py แล้ว
# db = SQLAlchemy(app)  <== ลบอันนี้ออก

# ต้องเชื่อม app กับ db ที่ import มาจาก models.py
db.init_app(app)  # << สำคัญ ต้องมีบรรทัดนี้

@app.route('/lists-service/todos-get', methods=['GET'])
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


@app.route('/lists-service/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    todo = Todo.query.get_or_404(todo_id)
    return jsonify(todo.to_dict())

@app.cli.command("init-db")
@with_appcontext
def init_db_command():
    """Clear existing data and create new tables."""
    db.drop_all()
    db.create_all()
    print("Initialized the database.")
    
@app.cli.command("seed-db")
@with_appcontext
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
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5001)
    