import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskListView } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, X } from 'lucide-react';
// import * as api from '../api';

interface Props {
    list: TaskListView;
    onAddCard: (listId: number, title: string) => Promise<void>;
    onDeleteList: (id: number) => Promise<void>;
    onDeleteCard: (id: number) => void;
}

export const TaskList: React.FC<Props> = ({ list, onAddCard, onDeleteList, onDeleteCard }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: list.id,
        data: { type: 'List', list }
    });

    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(list.title);



    return (
        <div
            ref={setNodeRef}
            className={`
                bg-black/10 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-full
                ${isOver ? 'ring-2 ring-blue-400' : ''}
            `}
        >
            {/* Header */}
            <div className="p-3 font-semibold text-white flex justify-between items-center cursor-grab active:cursor-grabbing">
                <h3>{list.title}</h3>
                <button
                    onClick={() => onDeleteList(list.id)}
                    className="p-1 hover:bg-white/20 rounded text-white/50 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto p-2 gap-2 flex flex-col custom-scrollbar">
                <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {list.cards.map(card => (
                        <TaskCard key={card.id} card={card} onDelete={onDeleteCard} />
                    ))}
                </SortableContext>
            </div>

            {/* Footer / Add Card */}
            <div className="p-2">
                {!isEditing ? (
                    <button
                        onClick={() => { setIsEditing(true); setTitle(''); }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors text-sm"
                    >
                        <Plus size={16} />
                        Add a card
                    </button>
                ) : (
                    <div className="bg-white rounded p-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                            autoFocus
                            placeholder="Enter a title for this card..."
                            className="w-full text-sm p-1 outline-none resize-none text-black"
                            rows={3}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (title.trim()) {
                                        onAddCard(list.id, title);
                                        setTitle('');
                                        setIsEditing(false);
                                    }
                                }
                            }}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={() => {
                                    if (title.trim()) {
                                        onAddCard(list.id, title);
                                        setTitle('');
                                        setIsEditing(false);
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                            >
                                Add Card
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 hover:bg-gray-200 text-gray-500 rounded"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
