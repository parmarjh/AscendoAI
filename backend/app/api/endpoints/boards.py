from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api import deps
from app.models import board as board_model
from app.schemas import all_schemas
from app.core.database import get_db

router = APIRouter()

@router.get("/", response_model=List[all_schemas.BoardRead])
async def read_boards(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    # Fetch boards owned by user, not deleted
    stmt = (
        select(board_model.Board)
        .where(
            board_model.Board.owner_id == current_user.id,
            board_model.Board.is_deleted == False  # pylint: disable=singleton-comparison
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=all_schemas.BoardRead)
async def create_board(
    item_in: all_schemas.BoardCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    board = board_model.Board(title=item_in.title, owner_id=current_user.id)
    db.add(board)
    await db.commit()
    await db.refresh(board)
    return board


@router.get("/{board_id}", response_model=all_schemas.BoardRead)
async def read_board(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    # N+1 Prevention: Load lists and cards in a single query
    # We rely on the model 'primaryjoin' to filter deleted items in relationships
    stmt = (
        select(board_model.Board)
        .where(
            board_model.Board.id == board_id,
            board_model.Board.is_deleted == False
        )
        .options(
            selectinload(board_model.Board.lists).selectinload(board_model.TaskList.cards)
        )
    )
    result = await db.execute(stmt)
    board = result.scalars().first()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Simple permission check (can be expanded)
    if board.owner_id != current_user.id:
         raise HTTPException(status_code=400, detail="Not enough permissions")
         
    return board


@router.delete("/{board_id}", response_model=all_schemas.BoardRead)
async def delete_board(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    stmt = select(board_model.Board).where(
        board_model.Board.id == board_id,
        board_model.Board.is_deleted == False
    )
    result = await db.execute(stmt)
    board = result.scalars().first()

    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")

    board.soft_delete()
    await db.commit()
    await db.refresh(board)
    return board
