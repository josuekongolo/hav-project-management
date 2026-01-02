import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { Comment, commentService } from '../../../services/commentService';
import { useAuthStore } from '../../../store/authStore';
import { Avatar, Spinner } from '../../ui';
import { CommentForm } from './CommentForm';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface CommentsListProps {
  taskId: string;
}

export function CommentsList({ taskId }: CommentsListProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentService.getByTask(taskId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const newComment = await commentService.create({ content, taskId });
      setComments([...comments, newComment]);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const handleUpdateComment = async (id: string, content: string) => {
    try {
      const updated = await commentService.update(id, { content });
      setComments(comments.map((c) => (c.id === id ? updated : c)));
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
      throw error;
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.delete(id);
      setComments(comments.filter((c) => c.id !== id));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar
              src={comment.author.avatar}
              name={comment.author.name}
              size="sm"
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.author.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {user?.id === comment.authorId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingCommentId(comment.id)}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <CommentForm
                    initialValue={comment.content}
                    onSubmit={(content) => handleUpdateComment(comment.id, content)}
                    onCancel={() => setEditingCommentId(null)}
                    submitLabel="Update"
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No comments yet. Be the first to comment!
        </p>
      )}

      <div className="border-t pt-4">
        <CommentForm onSubmit={handleAddComment} placeholder="Add a comment..." />
      </div>
    </div>
  );
}
