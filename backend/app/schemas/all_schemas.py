from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

# Card
class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    position: float = 65535.0

class CardCreate(CardBase):
    list_id: int

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[float] = None
    list_id: Optional[int] = None

class CardMove(BaseModel):
    new_list_id: int
    new_position: float

class CardRead(CardBase):
    id: int
    list_id: int
    is_deleted: bool

    class Config:
        from_attributes = True

# List
class TaskListBase(BaseModel):
    title: str
    position: float = 65535.0

class TaskListCreate(TaskListBase):
    board_id: int

class TaskListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[float] = None

class TaskListRead(TaskListBase):
    id: int
    board_id: int
    cards: List[CardRead] = []
    is_deleted: bool

    class Config:
        from_attributes = True

# Board
class BoardBase(BaseModel):
    title: str

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BoardBase):
    pass

class BoardRead(BoardBase):
    id: int
    owner_id: int
    lists: List[TaskListRead] = []
    is_deleted: bool

    class Config:
        from_attributes = True
