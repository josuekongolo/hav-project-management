import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../../services/taskService';

const labelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  color: z.string().min(1, 'Color is required').regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

type LabelFormData = z.infer<typeof labelSchema>;

interface LabelFormProps {
  label?: Label;
  onSubmit: (data: LabelFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
];

export function LabelForm({ label, onSubmit, onCancel, isLoading }: LabelFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: label
      ? {
          name: label.name,
          color: label.color,
        }
      : {
          name: '',
          color: '#3b82f6',
        },
  });

  const selectedColor = watch('color');

  const handleFormSubmit = (data: LabelFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Label Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Bug, Feature, Documentation"
          error={errors.name?.message}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color *
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-full h-10 rounded-lg transition-all ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            {...register('color')}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            type="text"
            {...register('color')}
            placeholder="#3b82f6"
            error={errors.color?.message}
          />
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Preview:</p>
        <div
          className="inline-block px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
        >
          {watch('name') || 'Label Name'}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : label ? 'Update Label' : 'Create Label'}
        </Button>
      </div>
    </form>
  );
}
