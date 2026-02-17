from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from app.core.database import Base
from app.models.base import SoftDeleteMixin

class User(Base, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=True)
