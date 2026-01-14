import { useEffect, useState } from 'react';
import { useDealStore } from '../../store/dealStore';
import { DealPipeline } from '../../components/features/crm/deals/DealPipeline';
import { DealForm } from '../../components/features/crm/deals/DealForm';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Deal, DealStage } from '../../services/dealService';
import { FilePlus, TrendingUp, DollarSign, CheckCircle, XCircle, Upload } from 'lucide-react';
import { BulkImportDialog } from '../../components/features/import';
import toast from 'react-hot-toast';

export function DealsPage() {
  const {
    deals,
    stats,
    isLoading,
    fetchDeals,
    fetchStats,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStage,
  } = useDealStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [initialStage, setInitialStage] = useState<DealStage | undefined>(undefined);
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    fetchDeals();
    fetchStats();
  }, [fetchDeals, fetchStats]);

  const handleCreateDeal = (stage?: DealStage) => {
    setSelectedDeal(null);
    setInitialStage(stage);
    setIsFormOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setInitialStage(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedDeal) {
        await updateDeal(selectedDeal.id, data);
        toast.success('Deal updated successfully');
      } else {
        await createDeal(data);
        toast.success('Deal created successfully');
      }
      setIsFormOpen(false);
      setSelectedDeal(null);
      setInitialStage(undefined);
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save deal');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      await deleteDeal(id);
      toast.success('Deal deleted successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete deal');
    }
  };

  const handleDealStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      await updateDealStage(dealId, newStage);
      toast.success('Deal stage updated');
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update deal stage');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your deals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)} className="w-full sm:w-auto justify-center">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => handleCreateDeal()} className="w-full sm:w-auto justify-center">
            <FilePlus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Pipeline</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${stats.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">{stats.totalDeals} deals</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Won Deals</p>
                <p className="text-2xl font-bold text-green-900">
                  ${stats.wonValue.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-1">{stats.wonDeals} deals</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Win Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats.winRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-700 mt-1">
                  {stats.wonDeals} / {stats.totalDeals} closed
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Lost Deals</p>
                <p className="text-2xl font-bold text-red-900">{stats.lostDeals}</p>
                <p className="text-xs text-red-700 mt-1">Opportunities lost</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </Card>
        </div>
      )}

      {/* Pipeline */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <DealPipeline
          deals={deals}
          onDealClick={handleEditDeal}
          onDeleteDeal={handleDeleteDeal}
          onDealStageChange={handleDealStageChange}
          onAddDeal={handleCreateDeal}
        />
      )}

      {/* Deal Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDeal(null);
          setInitialStage(undefined);
        }}
        title={selectedDeal ? 'Edit Deal' : 'New Deal'}
      >
        <DealForm
          deal={selectedDeal}
          initialStage={initialStage}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedDeal(null);
            setInitialStage(undefined);
          }}
        />
      </Modal>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityType="deals"
        onImportComplete={() => {
          fetchDeals();
          fetchStats();
        }}
      />
    </div>
  );
}
