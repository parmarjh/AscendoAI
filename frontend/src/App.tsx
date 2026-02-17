import * as React from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board, TaskListView } from './types';
import { TaskList } from './components/TaskList';
import * as api from './api';
import { LogOut, Plus } from 'lucide-react';

function App() {
    const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
    const [boards, setBoards] = React.useState<Board[]>([]);
    const [activeBoard, setActiveBoard] = React.useState<Board | null>(null);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    // const [activeCardId, setActiveCardId] = React.useState<number | null>(null); // Unused for now

    // Sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Wait for 5px movement before drag starts
            },
        })
    );

    React.useEffect(() => {
        if (token) {
            loadBoards();
        }
    }, [token]);

    const loadBoards = async () => {
        try {
            const res = await api.boards.list();
            setBoards(res.data);
            if (res.data.length > 0 && !activeBoard) {
                handleSelectBoard(res.data[0].id);
            }
        } catch (e) {
            console.error(e);
            logout();
        }
    };

    const handleSelectBoard = async (id: number) => {
        const res = await api.boards.get(id);
        const boardData = res.data;
        // Ensure cards are sorted by position
        boardData.lists.forEach((list: TaskListView) => {
            list.cards.sort((a: any, b: any) => a.position - b.position);
        });
        // Ensure lists are sorted by position
        boardData.lists.sort((a: any, b: any) => a.position - b.position);
        setActiveBoard(boardData);
    };

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.auth.login({ username: email, password });
            localStorage.setItem('token', res.data.access_token);
            setToken(res.data.access_token);
        } catch (err) {
            alert('Login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setBoards([]);
        setActiveBoard(null);
    };

    const handleDragStart = (_: DragStartEvent) => {
        // setActiveCardId(event.active.id as number);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        if (!activeBoard) return;

        // Find containers
        const activeList = findListByCardId(activeBoard, activeId as number);
        const overList = findListByCardId(activeBoard, overId as number) ||
            (over.data.current?.type === 'List' ? activeBoard.lists.find(l => l.id === overId) : null);

        if (!activeList || !overList) return;

        if (activeList !== overList) {
            // Moving between lists
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        // setActiveCardId(null);

        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id as number;

        if (!activeBoard) return;

        const sourceList = findListByCardId(activeBoard, activeId);
        const destList = findListByCardId(activeBoard, overId) ||
            (over.data.current?.type === 'List' ? activeBoard.lists.find(l => l.id === overId) : null);

        if (!sourceList || !destList) return;

        // Optimistic Update
        const oldBoardState = JSON.parse(JSON.stringify(activeBoard)); // Deep copy for rollback

        let newPosition = 0;
        let newBoard = { ...activeBoard };

        // Calculate new position
        if (sourceList === destList) {
            // Reordering within same list
            const oldIndex = sourceList.cards.findIndex(c => c.id === activeId);
            const newIndex = destList.cards.findIndex(c => c.id === overId);

            // Use arrayMove to get the new order temporarily to calculate position
            const reorderedCards = arrayMove(sourceList.cards, oldIndex, newIndex);

            // Calculate position based on new neighbors
            const prevCard = reorderedCards[newIndex - 1];
            const nextCard = reorderedCards[newIndex + 1];
            const prevPos = prevCard ? prevCard.position : (nextCard ? nextCard.position - 2000 : 1000);
            const nextPos = nextCard ? nextCard.position : (prevCard ? prevCard.position + 2000 : 3000);
            newPosition = (prevPos + nextPos) / 2;

            // Update local state
            const newCards = [...sourceList.cards];
            const [movedCard] = newCards.splice(oldIndex, 1);
            movedCard.position = newPosition;
            newCards.splice(newIndex, 0, movedCard);

            const newList = { ...sourceList, cards: newCards };
            newBoard.lists = newBoard.lists.map(l => l.id === newList.id ? newList : l);
            setActiveBoard(newBoard);
        } else {
            // Moving to different list
            const sourceIndex = sourceList.cards.findIndex(c => c.id === activeId);
            let destIndex = destList.cards.findIndex(c => c.id === overId); // If dropping on a card

            if (over.data.current?.type === 'List') {
                // Dropped on the list container directly
                destIndex = destList.cards.length;
            } else if (destIndex === -1) {
                destIndex = destList.cards.length;
            }

            // Calculate Position
            const prevCard = destList.cards[destIndex - 1];
            const nextCard = destList.cards[destIndex];
            const prevPos = prevCard ? prevCard.position : 1000.0;
            const nextPos = nextCard ? nextCard.position : prevPos + 2000.0;
            newPosition = (prevPos + nextPos) / 2;

            // Update Local State
            const newSourceCards = [...sourceList.cards];
            const [movedCard] = newSourceCards.splice(sourceIndex, 1);
            movedCard.list_id = destList.id;
            movedCard.position = newPosition;

            const newDestCards = [...destList.cards];
            newDestCards.splice(destIndex, 0, movedCard);

            newBoard.lists = newBoard.lists.map(l => {
                if (l.id === sourceList.id) return { ...sourceList, cards: newSourceCards };
                if (l.id === destList.id) return { ...destList, cards: newDestCards };
                return l;
            });
            setActiveBoard(newBoard);
        }

        // API Call
        try {
            await api.cards.move(activeId, {
                new_list_id: destList.id,
                new_position: newPosition
            });
        } catch (err) {
            console.error("Move failed, rolling back", err);
            setActiveBoard(oldBoardState);
            alert("Failed to move card");
        }
    };

    const findListByCardId = (board: Board, cardId: number) => {
        return board.lists.find(list => list.cards.some(c => c.id === cardId));
    };

    const handleAddList = async () => {
        const title = prompt("List Title:");
        if (!title || !activeBoard) return;
        try {
            // Pos at end
            const lastList = activeBoard.lists[activeBoard.lists.length - 1];
            const pos = lastList ? lastList.position + 1000 : 1000;
            const res = await api.lists.create({ title, board_id: activeBoard.id, position: pos });
            const newList = { ...res.data, cards: [] };
            setActiveBoard({ ...activeBoard, lists: [...activeBoard.lists, newList] });
        } catch (e) { console.error(e); }
    };

    const handleAddCard = async (listId: number, title: string) => {
        if (!activeBoard) return;
        const list = activeBoard.lists.find(l => l.id === listId);
        if (!list) return;

        // Pos at end of list
        const lastCard = list.cards[list.cards.length - 1];
        const pos = lastCard ? lastCard.position + 1000 : 1000;

        try {
            const res = await api.cards.create({ title, list_id: listId, position: pos });
            const newCard = res.data;

            const newLists = activeBoard.lists.map(l => {
                if (l.id === listId) {
                    return { ...l, cards: [...l.cards, newCard] };
                }
                return l;
            });
            setActiveBoard({ ...activeBoard, lists: newLists });
        } catch (e) { console.error(e); }
    };

    const handleDeleteCard = (id: number) => {
        if (!activeBoard) return;
        const newLists = activeBoard.lists.map(l => ({
            ...l,
            cards: l.cards.filter(c => c.id !== id)
        }));
        setActiveBoard({ ...activeBoard, lists: newLists });
    };

    const handleDeleteList = async (id: number) => {
        if (!activeBoard || !window.confirm("Delete list?")) return;
        try {
            await api.lists.delete(id);
            setActiveBoard({
                ...activeBoard,
                lists: activeBoard.lists.filter(l => l.id !== id)
            });
        } catch (e) { console.error(e); }
    }

    if (!token) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <form onSubmit={login} className="bg-white p-8 rounded shadow-md w-96">
                    <h1 className="text-2xl font-bold mb-4">TaskFlow Sign In</h1>
                    <input
                        className="w-full mb-3 p-2 border rounded"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full mb-4 p-2 border rounded"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Login
                    </button>
                    <p className="text-xs text-center mt-4 text-gray-500">For demo valid email/pass works if registered. If not, use same creds to register (not implemented in UI but API supports it, or just use Postman)</p>
                    {/* Quick register button for demo */}
                    <button type="button" onClick={async () => {
                        try { await api.auth.register({ email, password, full_name: "Demo User" }); alert("Registered! Login now."); }
                        catch (e) { alert("Registration failed or user exists."); }
                    }} className="w-full mt-2 text-blue-600 text-sm hover:underline">Register</button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0079bf]">
            {/* Header */}
            <header className="bg-black/20 text-white p-3 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">TaskFlow</h1>
                    <select
                        className="bg-white/20 text-white border-none rounded p-1 text-sm outline-none cursor-pointer"
                        onChange={(e) => handleSelectBoard(Number(e.target.value))}
                        value={activeBoard?.id || ''}
                    >
                        {boards.map(b => (
                            <option key={b.id} value={b.id} className="text-black">{b.title}</option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            const t = prompt("Board Title");
                            if (t) {
                                await api.boards.create({ title: t });
                                loadBoards();
                            }
                        }}
                        className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-sm transition-colors"
                    >
                        + New Board
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">User</span>
                    <button onClick={logout} className="p-1 hover:bg-white/20 rounded">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Board Canvas */}
            <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                {activeBoard ? (
                    <div className="flex gap-4 h-full items-start">
                        {/* DnD Context */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            {activeBoard.lists.map(list => (
                                <TaskList
                                    key={list.id}
                                    list={list}
                                    onAddCard={handleAddCard}
                                    onDeleteList={handleDeleteList}
                                    onDeleteCard={handleDeleteCard}
                                />
                            ))}
                        </DndContext>

                        {/* Add List Button */}
                        <button
                            onClick={handleAddList}
                            className="w-80 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg flex items-center gap-2 transition-colors text-left"
                        >
                            <Plus size={20} /> Add another list
                        </button>
                    </div>
                ) : (
                    <div className="text-white text-center mt-20">Select or create a board to get started.</div>
                )}
            </div>
        </div>
    );
}

export default App;
