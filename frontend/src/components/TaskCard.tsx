import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../types';
import { Trash2 } from 'lucide-react';
import { cards } from '../api';

interface Props {
    card: CardType;
    onDelete: (id: number) => void;
}

export function TaskCard({ card, onDelete }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id, data: { type: 'Card', card } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete card?')) {
            await cards.delete(card.id);
            onDelete(card.id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 group relative hover:border-blue-300 transition-colors cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start">
                <p className="text-sm text-gray-800 font-medium">{card.title}</p>
                <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            {card.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
            )}
        </div>
    );
}
