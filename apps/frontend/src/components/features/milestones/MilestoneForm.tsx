import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { Milestone, MilestoneStatus, CreateMilestoneDto } from '../../../services/milestoneService';

const milestoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.nativeEnum(MilestoneStatus).optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  milestone?: Milestone;
  onSubmit: (data: CreateMilestoneDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: MilestoneStatus.PLANNED, label: 'Planned' },
  { value: MilestoneStatus.ACTIVE, label: 'Active' },
  { value: MilestoneStatus.COMPLETED, label: 'Completed' },
  { value: MilestoneStatus.ARCHIVED, label: 'Archived' },
];

export function MilestoneForm({ milestone, onSubmit, onCancel, isLoading }: MilestoneFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: milestone
      ? {
          name: milestone.name,
          description: milestone.description || '',
          startDate: milestone.startDate.split('T')[0],
          endDate: milestone.endDate.split('T')[0],
          status: milestone.status,
        }
      : {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          status: MilestoneStatus.PLANNED,
        },
  });

  const handleFormSubmit = (data: MilestoneFormData) => {
    onSubmit(data as CreateMilestoneDto);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Q1 2024 Sprint"
          error={errors.name?.message}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Optional description of this milestone..."
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <Select id="status" {...register('status')}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : milestone ? 'Update Milestone' : 'Create Milestone'}
        </Button>
      </div>
    </form>
  );
}
