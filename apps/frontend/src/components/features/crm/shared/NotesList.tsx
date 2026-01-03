import { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { Note, NoteableType, noteService } from '../../../../services/noteService';
import { Edit2, Trash2, Save, X, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotesListProps {
  noteableType: NoteableType;
  noteableId: string;
}

export function NotesList({ noteableType, noteableId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [noteableType, noteableId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { notes: fetchedNotes } = await noteService.getNotesByEntity(noteableType, noteableId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      const { note } = await noteService.createNote({
        content: newNoteContent,
        noteableType,
        noteableId,
      });
      setNotes([note, ...notes]);
      setNewNoteContent('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      const { note } = await noteService.updateNote(noteId, { content: editContent });
      setNotes(notes.map((n) => (n.id === noteId ? note : n)));
      setEditingNoteId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        {!isAddingNote && (
          <Button onClick={() => setIsAddingNote(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </div>

      {isAddingNote && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="Write your note here..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button onClick={handleAddNote} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
            <Button onClick={() => { setIsAddingNote(false); setNewNoteContent(''); }} variant="secondary" size="sm">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 && !isAddingNote && (
        <div className="text-center py-8 text-gray-500">
          No notes yet. Add one to get started!
        </div>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
            {editingNoteId === note.id ? (
              <>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleSaveEdit(note.id)} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="secondary" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{note.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
