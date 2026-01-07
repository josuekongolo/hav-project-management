import { Deal } from '../../../../services/dealService';
import { Building2, DollarSign, Calendar, User, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DealCardProps {
  deal: Deal;
  onDealClick: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
}

export function DealCard({ deal, onDealClick, onDeleteDeal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="hover:shadow-lg transition-shadow relative group mb-3">
        <div
          className="cursor-pointer"
          onClick={() => onDealClick(deal)}
        >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{deal.title}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium text-green-600">
                ${deal.value.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this deal?')) {
                onDeleteDeal(deal.id);
              }
            }}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 sm:p-1 hover:bg-red-50 rounded flex-shrink-0"
          >
            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 text-red-600" />
          </button>
        </div>

        {deal.description && (
          <p
            className="text-sm text-gray-600 line-clamp-2 mb-3 w-full overflow-hidden"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {deal.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {deal.contact.firstName} {deal.contact.lastName}
              {deal.contact.company && ` - ${deal.contact.company}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="truncate">{deal.owner.name}</span>
          </div>

          {deal.expectedCloseDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Expected: {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{deal.probability}%</span>
          </div>
          {deal._count && deal._count.tasks > 0 && (
            <span className="text-xs text-gray-500">{deal._count.tasks} tasks</span>
          )}
        </div>
        </div>
      </Card>
    </div>
  );
}
