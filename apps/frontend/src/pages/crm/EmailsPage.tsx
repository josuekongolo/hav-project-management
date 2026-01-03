import { useEffect, useState } from 'react';
import { useEmailStore } from '../../store/emailStore';
import { EmailComposer } from '../../components/features/crm/emails/EmailComposer';
import { EmailHistory } from '../../components/features/crm/emails/EmailHistory';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { FilePlus, Mail, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { EmailStatus } from '../../services/emailService';
import toast from 'react-hot-toast';

export function EmailsPage() {
  const { emails, isLoading, fetchEmails, sendEmail, sendEmailWithTemplate, saveDraft, deleteEmail } =
    useEmailStore();

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSendEmail = async (data: any, useTemplate: boolean) => {
    try {
      if (useTemplate) {
        await sendEmailWithTemplate(data);
      } else {
        await sendEmail(data);
      }
      toast.success('Email sent successfully');
      setIsComposerOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send email');
    }
  };

  const handleSaveDraft = async (data: any) => {
    try {
      await saveDraft(data);
      toast.success('Draft saved successfully');
      setIsComposerOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save draft');
    }
  };

  const handleDeleteEmail = async (id: string) => {
    try {
      await deleteEmail(id);
      toast.success('Email deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete email');
    }
  };

  // Calculate stats
  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status === EmailStatus.SENT || e.status === EmailStatus.OPENED || e.status === EmailStatus.CLICKED).length,
    drafts: emails.filter((e) => e.status === EmailStatus.DRAFT).length,
    failed: emails.filter((e) => e.status === EmailStatus.FAILED).length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emails</h1>
          <p className="text-gray-600 mt-1">Send and track emails to your contacts</p>
        </div>
        <Button onClick={() => setIsComposerOpen(true)}>
          <FilePlus className="h-4 w-4 mr-2" />
          Compose Email
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Emails</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Sent</p>
              <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.drafts}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Email History */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <EmailHistory emails={emails} onDeleteEmail={handleDeleteEmail} />
      )}

      {/* Email Composer Modal */}
      <Modal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        title="Compose Email"
        size="large"
      >
        <EmailComposer
          onSend={handleSendEmail}
          onSaveDraft={handleSaveDraft}
          onCancel={() => setIsComposerOpen(false)}
        />
      </Modal>
    </div>
  );
}
