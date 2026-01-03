import { api } from './api';

export type NoteableType = 'Contact' | 'Deal' | 'Company';

export interface Note {
  id: string;
  content: string;
  noteableType: NoteableType;
  noteableId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface CreateNoteData {
  content: string;
  noteableType: NoteableType;
  noteableId: string;
}

export interface UpdateNoteData {
  content: string;
}

export const noteService = {
  async createNote(data: CreateNoteData): Promise<{ note: Note }> {
    const response = await api.post<{ note: Note }>('/notes', data);
    return response.data;
  },

  async getNotesByEntity(noteableType: NoteableType, noteableId: string): Promise<{ notes: Note[] }> {
    const params = new URLSearchParams();
    params.append('noteableType', noteableType);
    params.append('noteableId', noteableId);

    const response = await api.get<{ notes: Note[] }>(`/notes?${params.toString()}`);
    return response.data;
  },

  async getNoteById(id: string): Promise<{ note: Note }> {
    const response = await api.get<{ note: Note }>(`/notes/${id}`);
    return response.data;
  },

  async updateNote(id: string, data: UpdateNoteData): Promise<{ note: Note }> {
    const response = await api.patch<{ note: Note }>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/notes/${id}`);
    return response.data;
  },
};
