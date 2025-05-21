# models.py (ของ Tag Service)
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    color = db.Column(db.String(7), nullable=False, default="#000000")  # 🎨 เพิ่มคอลัมน์สี

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color  # ✅ ส่งออก color ด้วย
        }


class TodoTag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    todo_id = db.Column(db.Integer, nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

    tag = db.relationship('Tag', backref='todo_tags')

    def to_dict(self):
        return {
            "id": self.id,
            "todo_id": self.todo_id,
            "tag": self.tag.to_dict()
        }
