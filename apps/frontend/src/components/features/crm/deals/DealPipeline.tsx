import { useMemo } from 'react';
import { Deal, DealStage } from '../../../../services/dealService';
import { DealCard } from './DealCard';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';

interface DealPipelineProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onDealStageChange: (dealId: string, newStage: DealStage) => void;
  onAddDeal: (stage: DealStage) => void;
}

const stages: { value: DealStage; label: string; color: string }[] = [
  { value: DealStage.PROSPECT, label: 'Prospect', color: 'bg-gray-100' },
  { value: DealStage.QUALIFICATION, label: 'Qualification', color: 'bg-blue-100' },
  { value: DealStage.PROPOSAL, label: 'Proposal', color: 'bg-purple-100' },
  { value: DealStage.NEGOTIATION, label: 'Negotiation', color: 'bg-yellow-100' },
  { value: DealStage.CLOSED_WON, label: 'Closed Won', color: 'bg-green-100' },
  { value: DealStage.CLOSED_LOST, label: 'Closed Lost', color: 'bg-red-100' },
];

export function DealPipeline({
  deals,
  onDealClick,
  onDeleteDeal,
  onDealStageChange,
  onAddDeal,
}: DealPipelineProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dealsByStage = useMemo(() => {
    const grouped = stages.reduce((acc, stage) => {
      acc[stage.value] = deals.filter((deal) => deal.stage === stage.value);
      return acc;
    }, {} as Record<DealStage, Deal[]>);

    return grouped;
  }, [deals]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const deal = deals.find((d) => d.id === active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      onDealStageChange(dealId, newStage);
    }
  };

  const calculateStageValue = (stageDeals: Deal[]) => {
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4 pb-4 min-w-min">
          {stages.map((stage) => {
            const stageDeals = dealsByStage[stage.value] || [];
            const stageValue = calculateStageValue(stageDeals);

            return (
              <div key={stage.value} className="flex-shrink-0 w-72 sm:w-80">
              <div className={`rounded-lg ${stage.color} p-3 mb-3`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <button
                    onClick={() => onAddDeal(stage.value)}
                    className="p-1 hover:bg-white/50 rounded transition-colors"
                    title="Add deal"
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{stageDeals.length} deals</span>
                  <span className="font-medium text-gray-900">
                    ${stageValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <SortableContext
                id={stage.value}
                items={stageDeals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto space-y-3"
                  data-stage={stage.value}
                >
                  {stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onDealClick={onDealClick}
                      onDeleteDeal={onDeleteDeal}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
        </div>
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="w-72 sm:w-80 opacity-90">
            <DealCard
              deal={activeDeal}
              onDealClick={() => {}}
              onDeleteDeal={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
