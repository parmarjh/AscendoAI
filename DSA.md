# Data Structures and Algorithms (DSA) in TaskFlow

TaskFlow leverages a specific algorithmic strategy to handle the efficient reordering of tasks (Cards) within and between lists.

## The Problem: Efficient Reordering

In a typical Kanban/Trello-like board, users frequently drag and drop items to reorder them.  
If we used simple integer positions (1, 2, 3...):
- Moving item 1 to position 50 would require decrementing the positions of items 2 through 50.
- This results in **O(N)** database writes for a single move, which is slow and prone to race conditions.

## The Solution: Fractional Indexing (Floating Point Ordering)

We use **Floating Point Indexing** (also known as Fractional Indexing) to achieve **O(1)** performance for reordering.

### Concept

Instead of sequential integers (1, 2, 3), we use widely spaced floating-point numbers (e.g., `1000.0`, `2000.0`, `3000.0`).

### Insertion Logic

When an item is dropped between two other items, we calculate its new position by taking the **average** of the two surrounding positions.

**Example:**
*   Card A: Position `1000.0`
*   Card B: Position `2000.0`
*   **User drops Card C between A and B.**
*   New Position for C = `(1000.0 + 2000.0) / 2` = `1500.0`

**Database State becomes:**
*   Card A: `1000.0`
*   Card C: `1500.0`
*   Card B: `2000.0`

**Result:** Only **one** record (Card C) needs to be updated in the database. `Card A` and `Card B` remain untouched.

### Edge Cases

1.  **Top of List**: If dropped at the very top, we subtract a buffer from the first item's position.
    *   `New Pos = First_Pos - 1000.0`
2.  **Bottom of List**: If dropped at the bottom, we add a buffer.
    *   `New Pos = Last_Pos + 1000.0`
3.  **Empty List**: We default to a starting value (e.g., `1000.0`).

## Implementation Details

### Frontend (`frontend/src/App.tsx`)

The `handleDragEnd` function calculates the new position before sending it to the backend.

```typescript
// Simplified logic from App.tsx
const prevPos = prevCard ? prevCard.position : (nextCard ? nextCard.position - 2000 : 1000);
const nextPos = nextCard ? nextCard.position : (prevCard ? prevCard.position + 2000 : 3000);
newPosition = (prevPos + nextPos) / 2;
```

### Backend (`backend/app/api/endpoints/cards.py`)

The backend simply accepts the `new_position` and updates the record.
*   **Concurrency**: We use `SELECT ... FOR UPDATE` (on PostgreSQL) to lock the row during the move to ensure atomicity, though the O(1) nature drastically reduces collision windows.

## Complexity Analysis

| Operation | Standard Integer Indexing | Fractional Indexing (Used) |
| :--- | :--- | :--- |
| **Insert/Move** | O(N) - Worst case updates all items | **O(1)** - Updates single item |
| **Read/Sort** | O(N log N) | O(N log N) |
