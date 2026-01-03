import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDealStore } from '../../store/dealStore';
import { ActivityTimeline } from '../../components/features/crm/shared/ActivityTimeline';
import { DealForm } from '../../components/features/crm/deals/DealForm';
import { NotesList } from '../../components/features/crm/shared/NotesList';
import { CallLogDialog } from '../../components/features/crm/shared/CallLogDialog';
import { MeetingDialog } from '../../components/features/crm/shared/MeetingDialog';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { DealStage } from '../../services/dealService';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Edit,
  DollarSign,
  Calendar,
  Target,
  PhoneCall,
  User,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const stageColors: Record<DealStage, string> = {
  [DealStage.PROSPECT]: 'bg-gray-100 text-gray-800',
  [DealStage.QUALIFICATION]: 'bg-blue-100 text-blue-800',
  [DealStage.PROPOSAL]: 'bg-purple-100 text-purple-800',
  [DealStage.NEGOTIATION]: 'bg-yellow-100 text-yellow-800',
  [DealStage.CLOSED_WON]: 'bg-green-100 text-green-800',
  [DealStage.CLOSED_LOST]: 'bg-red-100 text-red-800',
};

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedDeal,
    dealActivities,
    dealTasks,
    isLoading,
    isLoadingActivities,
    fetchDealById,
    fetchDealActivities,
    fetchDealTasks,
    updateDeal,
  } = useDealStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDealById(id);
      fetchDealActivities(id);
      fetchDealTasks(id);
    }
  }, [id, fetchDealById, fetchDealActivities, fetchDealTasks]);

  const handleEditDeal = async (data: any) => {
    if (!id) return;
    try {
      await updateDeal(id, data);
      toast.success('Deal updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update deal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Deal not found</p>
        <Button onClick={() => navigate('/crm/deals')} className="mt-4">
          Back to Deals
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/crm/deals')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedDeal.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  stageColors[selectedDeal.stage]
                }`}
              >
                {selectedDeal.stage.replace('_', ' ')}
              </span>
              {selectedDeal.owner && (
                <span className="text-sm text-gray-600">Owner: {selectedDeal.owner.name}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setIsCallDialogOpen(true)}>
              <PhoneCall className="h-4 w-4 mr-2" />
              Log Call
            </Button>
            <Button variant="secondary" onClick={() => setIsMeetingDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Deal Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Deal Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="text-xl font-bold text-green-600">
                    ${selectedDeal.value.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${selectedDeal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedDeal.probability}%
                    </span>
                  </div>
                </div>
              </div>

              {selectedDeal.contact && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <Link
                      to={`/crm/contacts/${selectedDeal.contact.id}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedDeal.contact.firstName} {selectedDeal.contact.lastName}
                    </Link>
                    {selectedDeal.contact.email && (
                      <p className="text-sm text-gray-600">{selectedDeal.contact.email}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedDeal.companyRel && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <Link
                      to={`/crm/companies/${selectedDeal.companyRel.id}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {selectedDeal.companyRel.name}
                    </Link>
                  </div>
                </div>
              )}

              {selectedDeal.expectedCloseDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Close Date</p>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedDeal.expectedCloseDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {selectedDeal.description && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {selectedDeal.description}
              </p>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedDeal.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last updated:</span>{' '}
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(selectedDeal.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Activities & Related Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">Tasks</p>
                  <p className="text-2xl font-bold text-green-900">{dealTasks.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-600">Activities</p>
                  <p className="text-2xl font-bold text-orange-900">{dealActivities.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tasks */}
          {dealTasks.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                <Link to="/kanban" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {dealTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Target className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <ActivityTimeline activities={dealActivities} isLoading={isLoadingActivities} />
          </Card>

          {/* Notes */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <NotesList noteableType="Deal" noteableId={id!} />
          </Card>
        </div>
      </div>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Deal"
      >
        <DealForm
          deal={selectedDeal}
          onSubmit={handleEditDeal}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Call Log Dialog */}
      <CallLogDialog
        isOpen={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        dealId={id}
        onSuccess={() => {
          if (id) {
            fetchDealActivities(id);
          }
        }}
      />

      {/* Meeting Dialog */}
      <MeetingDialog
        isOpen={isMeetingDialogOpen}
        onClose={() => setIsMeetingDialogOpen(false)}
        dealId={id}
        onSuccess={() => {
          if (id) {
            fetchDealActivities(id);
          }
        }}
      />
    </div>
  );
}
