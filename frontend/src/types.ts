export interface Card {
    id: number;
    title: string;
    description: string;
    position: number;
    list_id: number;
    is_deleted?: boolean;
}

export interface TaskListView {
    id: number;
    title: string;
    position: number;
    board_id: number;
    cards: Card[];
    is_deleted?: boolean;
}

export interface Board {
    id: number;
    title: string;
    owner_id: number;
    lists: TaskListView[];
    is_deleted?: boolean;
}
