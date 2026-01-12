import api from '@/lib/axios';

const BASE_PATH = '/kanban-board/api/v1.0.0/boards';

// Types
export interface Board {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface CreateBoardRequest {
    title: string;
}

// Boards API Service
export const boardsApi = {
    fetchBoards: () =>
        api.get<Board[]>(BASE_PATH),

    fetchBoard: (id: string) =>
        api.get<Board>(`${BASE_PATH}/${id}`),

    createBoard: (data: CreateBoardRequest) =>
        api.post<Board>(BASE_PATH, data),

    updateBoard: (id: string, data: Partial<CreateBoardRequest>) =>
        api.patch<Board>(`${BASE_PATH}/${id}`, data),

    deleteBoard: (id: string) =>
        api.delete(`${BASE_PATH}/${id}`),
};
