from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models import board as board_model
from app.schemas import all_schemas
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=all_schemas.TaskListRead)
async def create_list(
    item_in: all_schemas.TaskListCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    # Check board ownership
    stmt = select(board_model.Board).where(
        board_model.Board.id == item_in.board_id,
        board_model.Board.owner_id == current_user.id,
        board_model.Board.is_deleted == False
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Board not found")

    new_list = board_model.TaskList(**item_in.dict())
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list)
    return new_list

@router.put("/{list_id}", response_model=all_schemas.TaskListRead)
async def update_list(
    list_id: int,
    item_in: all_schemas.TaskListUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    stmt = (
        select(board_model.TaskList)
        .join(board_model.Board)
        .where(
            board_model.TaskList.id == list_id,
            board_model.Board.owner_id == current_user.id,
            board_model.Board.is_deleted == False,
            board_model.TaskList.is_deleted == False
        )
    )
    result = await db.execute(stmt)
    task_list = result.scalars().first()

    if not task_list:
        raise HTTPException(status_code=404, detail="List not found")

    if item_in.title is not None:
        task_list.title = item_in.title
    if item_in.position is not None:
        task_list.position = item_in.position
    
    await db.commit()
    await db.refresh(task_list)
    return task_list

@router.delete("/{list_id}")
async def delete_list(
    list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    stmt = (
        select(board_model.TaskList)
        .join(board_model.Board)
        .where(
            board_model.TaskList.id == list_id,
            board_model.Board.owner_id == current_user.id,
            board_model.Board.is_deleted == False,
            board_model.TaskList.is_deleted == False
        )
    )
    result = await db.execute(stmt)
    task_list = result.scalars().first()

    if not task_list:
        raise HTTPException(status_code=404, detail="List not found")

    task_list.soft_delete()
    await db.commit()
    return {"ok": True}
