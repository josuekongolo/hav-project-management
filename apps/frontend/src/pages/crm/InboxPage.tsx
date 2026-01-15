import { useEffect, useState } from 'react';
import { useEmailStore } from '../../store/emailStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Inbox, Eye, MousePointer, MessageSquare, Trash2 } from 'lucide-react';
import { Email } from '../../services/emailService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 25;

type TabType = 'opened' | 'clicked' | 'replies';

export function InboxPage() {
  const { emails, pagination, isLoading, fetchEmails, deleteEmail, bulkDeleteEmails } = useEmailStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('opened');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openedCount, setOpenedCount] = useState(0);
  const [clickedCount, setClickedCount] = useState(0);

  useEffect(() => {
    // Fetch emails for the active tab
    if (activeTab !== 'replies') {
      fetchEmails({
        engagement: activeTab as 'opened' | 'clicked',
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
    }
  }, [fetchEmails, activeTab, currentPage]);

  // Fetch counts for opened and clicked tabs (separate queries)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get opened count
        const openedResponse = await fetch(`${import.meta.env.VITE_API_URL}/emails?engagement=opened&limit=1`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (openedResponse.ok) {
          const openedData = await openedResponse.json();
          setOpenedCount(openedData.pagination?.total || 0);
        }

        // Get clicked count
        const clickedResponse = await fetch(`${import.meta.env.VITE_API_URL}/emails?engagement=clicked&limit=1`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (clickedResponse.ok) {
          const clickedData = await clickedResponse.json();
          setClickedCount(clickedData.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
  }, [emails]); // Refetch when emails change

  // Filter emails - for opened/clicked, the server already filters
  const filteredEmails = activeTab === 'replies' ? [] : emails;

  // Stats
  const stats = {
    opened: openedCount,
    clicked: clickedCount,
    replies: 0, // Would be populated with actual reply data
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      await deleteEmail(id);
      toast.success('Email deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete email');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} emails?`)) return;

    try {
      const result = await bulkDeleteEmails(selectedIds);
      toast.success(`${result.deleted} emails deleted successfully`);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete emails');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map(e => e.id));
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const tabs = [
    { id: 'opened' as TabType, label: 'Opened', icon: Eye, count: stats.opened },
    { id: 'clicked' as TabType, label: 'Clicked', icon: MousePointer, count: stats.clicked },
    { id: 'replies' as TabType, label: 'Replies', icon: MessageSquare, count: stats.replies },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track email engagement and responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Opened</p>
              <p className="text-2xl font-bold text-purple-900">{stats.opened}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Clicked</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.clicked}</p>
            </div>
            <MousePointer className="h-8 w-8 text-indigo-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Replies</p>
              <p className="text-2xl font-bold text-green-900">{stats.replies}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <Badge className="bg-gray-100 text-gray-700 text-xs">{tab.count}</Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions */}
      {activeTab !== 'replies' && filteredEmails.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isSelectionMode ? (
                <Button
                  variant="secondary"
                  onClick={() => setIsSelectionMode(true)}
                  className="w-full sm:w-auto justify-center"
                >
                  Select Emails
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleSelectAll}
                    className="w-full sm:w-auto justify-center"
                  >
                    {selectedIds.length === filteredEmails.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    className="w-full sm:w-auto justify-center text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.length})
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={exitSelectionMode}
                    className="w-full sm:w-auto justify-center"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activeTab === 'replies' ? (
        <Card className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Replies Coming Soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Reply tracking requires webhook integration with your email provider.
            Contact support to enable this feature.
          </p>
        </Card>
      ) : filteredEmails.length === 0 ? (
        <Card className="text-center py-12">
          <Inbox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} emails yet
          </h3>
          <p className="text-gray-500">
            {activeTab === 'opened'
              ? 'Emails will appear here when contacts open them.'
              : 'Emails will appear here when contacts click links in them.'}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                type={activeTab}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(email.id)}
                onToggleSelection={handleToggleSelection}
                onDelete={handleDeleteEmail}
                onClick={() => navigate(`/crm/emails/${email.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface EmailCardProps {
  email: Email;
  type: 'opened' | 'clicked';
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

function EmailCard({
  email,
  type,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  onDelete,
  onClick
}: EmailCardProps) {
  const engagementDate = type === 'opened' ? email.openedAt : email.clickedAt;

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(email.id);
    } else {
      onClick();
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Card
        className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
      >
        <div className="flex items-start gap-4">
        {isSelectionMode ? (
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(email.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
          </div>
        ) : (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            type === 'opened' ? 'bg-purple-100' : 'bg-indigo-100'
          }`}>
            {type === 'opened' ? (
              <Eye className="h-5 w-5 text-purple-600" />
            ) : (
              <MousePointer className="h-5 w-5 text-indigo-600" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{email.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">
                To: {email.to.join(', ')}
                {email.contact && (
                  <span className="ml-2">
                    ({email.contact.firstName} {email.contact.lastName})
                  </span>
                )}
              </p>
            </div>
            {!isSelectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this email?')) {
                    onDelete(email.id);
                  }
                }}
                className="p-1 hover:bg-red-50 rounded flex-shrink-0"
                title="Delete email"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className={`flex items-center gap-1 ${type === 'opened' ? 'text-purple-600' : 'text-indigo-600'}`}>
              {type === 'opened' ? (
                <Eye className="h-4 w-4" />
              ) : (
                <MousePointer className="h-4 w-4" />
              )}
              <span>
                {type === 'opened' ? 'Opened' : 'Clicked'}{' '}
                {engagementDate && format(new Date(engagementDate), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {email.sentAt && (
              <span className="text-gray-500">
                Sent {format(new Date(email.sentAt), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
}
