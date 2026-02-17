from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models import board as board_model
from app.schemas import all_schemas
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=all_schemas.CardRead)
async def create_card(
    item_in: all_schemas.CardCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    # Verify list exists and user has access (via board owner)
    stmt = (
        select(board_model.TaskList)
        .join(board_model.Board)
        .where(
            board_model.TaskList.id == item_in.list_id,
            board_model.Board.owner_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="List not found or permission denied")

    card = board_model.Card(**item_in.dict())
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.put("/{card_id}/move", response_model=all_schemas.CardRead)
async def move_card(
    card_id: int,
    move_data: all_schemas.CardMove,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    # Start Transaction with Locking
    # We use with_for_update() to lock the selected row(s)
    # This ensures if two requests try to move the same card, one waits.
    
    async with db.begin(): # Explicit transaction block
        stmt = (
            select(board_model.Card)
            .join(board_model.TaskList) # Join to check permissions if needed
            .join(board_model.Board)
            .where(
                 board_model.Card.id == card_id,
                 board_model.Board.owner_id == current_user.id,
                 board_model.Board.is_deleted == False,
                 board_model.TaskList.is_deleted == False
            )
        )
        
        # SQLite doesn't support FOR UPDATE extensively or at all in some modes
        if db.bind.dialect.name != "sqlite":
             stmt = stmt.with_for_update()

        result = await db.execute(stmt)
        card = result.scalars().first()

        if not card:
             raise HTTPException(status_code=404, detail="Card not found or permission denied")
        
        # Verify new list exists (optional but good practice) if list changed
        if move_data.new_list_id != card.list_id:
             stmt_list = select(board_model.TaskList).where(board_model.TaskList.id == move_data.new_list_id)
             res_list = await db.execute(stmt_list)
             if not res_list.scalars().first():
                 raise HTTPException(status_code=404, detail="Target list not found")

        # Update
        card.list_id = move_data.new_list_id
        card.position = move_data.new_position
        
        await db.commit() 
        # Note: In async sqlalchemy within 'async with db.begin()', commit might happen automatically on exit,
        # but explicit commit ensures we control the point of success.
        # Actually 'async with db.begin()' commits on exit if no exception.
        # We need to refresh to return the updated object.
        # Since the session helps manages identity map, refreshing usually works after commit.
    
    await db.refresh(card)
    return card

@router.delete("/{card_id}")
async def delete_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(deps.get_current_user),
) -> Any:
    stmt = (
        select(board_model.Card)
        .join(board_model.TaskList)
        .join(board_model.Board)
        .where(
            board_model.Card.id == card_id,
            board_model.Board.owner_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    card = result.scalars().first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.soft_delete()
    await db.commit()
    return {"ok": True}
