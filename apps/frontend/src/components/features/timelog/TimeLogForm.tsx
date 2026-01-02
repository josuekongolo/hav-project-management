import { useState } from 'react';
import { Button, Input, Textarea } from '../../ui';

interface TimeLogFormProps {
  onSubmit: (hours: number, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function TimeLogForm({ onSubmit, onCancel }: TimeLogFormProps) {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(hours);

    if (!hoursNum || hoursNum <= 0 || hoursNum > 24) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(hoursNum, description.trim() || undefined);
      setHours('');
      setDescription('');
    } catch (error) {
      // Error handling done in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Hours"
        type="number"
        step="0.25"
        min="0.25"
        max="24"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        placeholder="e.g., 2.5"
        required
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What did you work on?"
        rows={2}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!hours || isSubmitting}
          isLoading={isSubmitting}
        >
          Log Time
        </Button>
      </div>
    </form>
  );
}
