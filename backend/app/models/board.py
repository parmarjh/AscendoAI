from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey, Float, Text
from app.core.database import Base
from app.models.base import SoftDeleteMixin
from typing import List as PyList

class Board(Base, SoftDeleteMixin):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User")
    lists: Mapped[PyList["TaskList"]] = relationship("TaskList", back_populates="board", cascade="all, delete-orphan", primaryjoin="and_(Board.id==TaskList.board_id, TaskList.is_deleted.is_(False))")


class TaskList(Base, SoftDeleteMixin):
    __tablename__ = "task_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[float] = mapped_column(Float, nullable=False, default=65535.0) # Floating point ordering
    board_id: Mapped[int] = mapped_column(Integer, ForeignKey("boards.id"), nullable=False)

    # Relationships
    board = relationship("Board", back_populates="lists")
    cards: Mapped[PyList["Card"]] = relationship("Card", back_populates="task_list", cascade="all, delete-orphan", primaryjoin="and_(TaskList.id==Card.list_id, Card.is_deleted.is_(False))")


class Card(Base, SoftDeleteMixin):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    position: Mapped[float] = mapped_column(Float, nullable=False, default=65535.0) # Floating point ordering
    list_id: Mapped[int] = mapped_column(Integer, ForeignKey("task_lists.id"), nullable=False)

    # Relationships
    task_list = relationship("TaskList", back_populates="cards")
