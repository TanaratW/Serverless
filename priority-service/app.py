from flask import Flask, jsonify, Response, request
from flask.cli import with_appcontext
import prometheus_client
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import db, Tag, TodoTag  

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///todoapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


# --- Tag Routes ---

@app.route('/priority-service/tags', methods=['POST'])
def create_tag():
    data = request.json
    name = data.get('name')
    color = data.get('color', '#000000')  # 🎨 ค่า default ถ้าไม่ส่งมา

    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    if Tag.query.filter_by(name=name).first():
        return jsonify({"error": "Tag already exists"}), 409

    tag = Tag(name=name, color=color)
    db.session.add(tag)
    db.session.commit()
    return jsonify(tag.to_dict()), 201


@app.route('/priority-service/tags', methods=['GET'])
def get_all_tags():
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags])


# --- Todo-Tag Association ---

@app.route('/priority-service/todo-tags', methods=['POST'])
def assign_tag_to_todo():
    data = request.json
    todo_id = data.get('todo_id')
    tag_name = data.get('tag')

    if not todo_id or not tag_name:
        return jsonify({"error": "todo_id and tag are required"}), 400

    tag = Tag.query.filter_by(name=tag_name).first()
    if not tag:
        tag = Tag(name=tag_name)
        db.session.add(tag)
        db.session.commit()

    todo_tag = TodoTag(todo_id=todo_id, tag_id=tag.id)
    db.session.add(todo_tag)
    db.session.commit()

    return jsonify(todo_tag.to_dict()), 201


@app.route('/priority-service/todo-tags/<int:todo_id>', methods=['GET'])
def get_tags_for_todo(todo_id):
    todo_tags = TodoTag.query.filter_by(todo_id=todo_id).all()
    return jsonify([tt.to_dict() for tt in todo_tags])


# --- Database CLI Commands ---

@app.cli.command("init-db")
@with_appcontext
def init_db_command():
    db.drop_all()
    db.create_all()
    print("✅ Initialized the database.")


@app.cli.command("seed-db")
@with_appcontext
def seed_db_command():
    db.session.query(Tag).delete()

    tags = [
        Tag(name='Work', color='#FF5733'),
        Tag(name='Personal', color='#337BFF'),
        Tag(name='Urgent', color='#FF0000')
    ]

    db.session.bulk_save_objects(tags)
    db.session.commit()
    print("🌱 Seeded tag data.")



# --- Prometheus Metrics ---

@app.route('/metrics')
def metrics():
    return Response(prometheus_client.generate_latest(), mimetype='text/plain')


# --- App Run ---

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5002)
