import { useEffect, useState } from 'react';
import { useEmailTemplateStore } from '../../store/emailTemplateStore';
import { EmailTemplateList } from '../../components/features/crm/emails/EmailTemplateList';
import { EmailTemplateForm } from '../../components/features/crm/emails/EmailTemplateForm';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { EmailTemplate, EmailTemplateCategory } from '../../services/emailTemplateService';
import { FilePlus, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export function EmailTemplatesPage() {
  const {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setCategoryFilter,
  } = useEmailTemplateStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [categoryFilter, setCategoryFilterLocal] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, data);
        toast.success('Template updated successfully');
      } else {
        await createTemplate(data);
        toast.success('Template created successfully');
      }
      setIsFormOpen(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast.success('Template deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete template');
    }
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilterLocal(value);
    setCategoryFilter(value ? (value as EmailTemplateCategory) : null);
  };

  // Calculate stats
  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
    totalSent: templates.reduce((sum, t) => sum + (t._count?.emails || 0), 0),
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage reusable email templates</p>
        </div>
        <Button onClick={handleCreateTemplate} className="w-full sm:w-auto justify-center">
          <FilePlus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Templates</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Emails Sent</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalSent}</p>
            </div>
            <Mail className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by category:</label>
          <Select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: EmailTemplateCategory.WELCOME, label: 'Welcome' },
              { value: EmailTemplateCategory.FOLLOW_UP, label: 'Follow-up' },
              { value: EmailTemplateCategory.PROPOSAL, label: 'Proposal' },
              { value: EmailTemplateCategory.INVOICE, label: 'Invoice' },
              { value: EmailTemplateCategory.GENERAL, label: 'General' },
            ]}
            className="w-64"
          />
        </div>
      </Card>

      {/* Template List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <EmailTemplateList
          templates={templates}
          onTemplateClick={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}

      {/* Template Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTemplate(null);
        }}
        title={selectedTemplate ? 'Edit Email Template' : 'New Email Template'}
        size="full"
      >
        <EmailTemplateForm
          key={selectedTemplate?.id || 'new'}
          template={selectedTemplate}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedTemplate(null);
          }}
        />
      </Modal>
    </div>
  );
}
