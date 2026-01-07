import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmailStore } from '../../store/emailStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmailComposer } from '../../components/features/crm/emails/EmailComposer';
import {
  ArrowLeft,
  Mail,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MousePointer,
  User,
  Calendar,
  FileText,
  Reply,
  ReplyAll
} from 'lucide-react';
import { EmailStatus } from '../../services/emailService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusColors: Record<EmailStatus, string> = {
  [EmailStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [EmailStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [EmailStatus.SENDING]: 'bg-yellow-100 text-yellow-800',
  [EmailStatus.SENT]: 'bg-green-100 text-green-800',
  [EmailStatus.FAILED]: 'bg-red-100 text-red-800',
  [EmailStatus.OPENED]: 'bg-purple-100 text-purple-800',
  [EmailStatus.CLICKED]: 'bg-indigo-100 text-indigo-800',
};

const statusIcons: Record<EmailStatus, any> = {
  [EmailStatus.DRAFT]: Clock,
  [EmailStatus.SCHEDULED]: Clock,
  [EmailStatus.SENDING]: Clock,
  [EmailStatus.SENT]: CheckCircle,
  [EmailStatus.FAILED]: XCircle,
  [EmailStatus.OPENED]: Eye,
  [EmailStatus.CLICKED]: MousePointer,
};

export function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedEmail, fetchEmailById, deleteEmail, sendEmail, isLoading } = useEmailStore();
  const [showHtml, setShowHtml] = useState(true);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyType, setReplyType] = useState<'reply' | 'replyAll'>('reply');

  useEffect(() => {
    if (id) {
      fetchEmailById(id);
    }
  }, [id, fetchEmailById]);

  const handleDelete = async () => {
    if (!selectedEmail) return;

    if (confirm('Are you sure you want to delete this email?')) {
      try {
        await deleteEmail(selectedEmail.id);
        toast.success('Email deleted successfully');
        navigate('/crm/emails');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete email');
      }
    }
  };

  const handleBack = () => {
    navigate('/crm/emails');
  };

  const handleReply = () => {
    setReplyType('reply');
    setIsReplyModalOpen(true);
  };

  const handleReplyAll = () => {
    setReplyType('replyAll');
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async (data: any, useTemplate: boolean) => {
    try {
      await sendEmail(data);
      toast.success('Reply sent successfully');
      setIsReplyModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reply');
    }
  };

  const getReplyTo = () => {
    if (!selectedEmail) return '';
    // Reply to the sender's email
    return selectedEmail.from;
  };

  const getReplyCc = () => {
    if (!selectedEmail || replyType !== 'replyAll') return '';
    // Reply All: include original recipients except yourself
    const allRecipients = [
      ...selectedEmail.to,
      ...(selectedEmail.cc || [])
    ];
    return allRecipients.join(', ');
  };

  const getReplySubject = () => {
    if (!selectedEmail) return '';
    const subject = selectedEmail.subject;
    return subject.startsWith('Re: ') ? subject : `Re: ${subject}`;
  };

  const getReplyBody = () => {
    if (!selectedEmail) return '';
    const originalDate = format(new Date(selectedEmail.sentAt || selectedEmail.createdAt), 'MMMM d, yyyy h:mm a');
    const originalSender = selectedEmail.sender.name;

    return `<br><br>---<br>On ${originalDate}, ${originalSender} wrote:<br><blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 0;">${selectedEmail.htmlBody || selectedEmail.body}</blockquote>`;
  };

  if (isLoading || !selectedEmail) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[selectedEmail.status];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="secondary" onClick={handleBack} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Emails
          </Button>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{selectedEmail.subject}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={statusColors[selectedEmail.status]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {selectedEmail.status}
                </Badge>
                {selectedEmail.template && (
                  <Badge className="bg-blue-50 text-blue-700">
                    Template: {selectedEmail.template.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={handleReply} className="w-full sm:w-auto justify-center">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="secondary" onClick={handleReplyAll} className="w-full sm:w-auto justify-center">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="secondary" onClick={handleDelete} className="w-full sm:w-auto justify-center">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Body */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Content</h2>
              {selectedEmail.htmlBody && (
                <div className="flex gap-2">
                  <Button
                    variant={showHtml ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setShowHtml(true)}
                  >
                    HTML
                  </Button>
                  <Button
                    variant={!showHtml ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setShowHtml(false)}
                  >
                    Plain Text
                  </Button>
                </div>
              )}
            </div>

            {showHtml && selectedEmail.htmlBody ? (
              <div
                className="prose max-w-none border border-gray-200 rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-gray-700 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {selectedEmail.body}
              </div>
            )}
          </Card>

          {/* Error Message */}
          {selectedEmail.status === EmailStatus.FAILED && selectedEmail.errorMessage && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Failed to Send</h3>
                  <p className="text-sm text-red-800">{selectedEmail.errorMessage}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Tracking Info */}
          {(selectedEmail.openedAt || selectedEmail.clickedAt) && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Tracking</h2>
              <div className="space-y-3">
                {selectedEmail.openedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Opened</p>
                      <p className="text-gray-600">
                        {format(new Date(selectedEmail.openedAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                {selectedEmail.clickedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <MousePointer className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Link Clicked</p>
                      <p className="text-gray-600">
                        {format(new Date(selectedEmail.clickedAt), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recipients */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">To:</label>
                <div className="space-y-1">
                  {selectedEmail.to.map((email, idx) => (
                    <div key={idx} className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {email}
                    </div>
                  ))}
                </div>
              </div>

              {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">CC:</label>
                  <div className="space-y-1">
                    {selectedEmail.cc.map((email, idx) => (
                      <div key={idx} className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmail.bcc && selectedEmail.bcc.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">BCC:</label>
                  <div className="space-y-1">
                    {selectedEmail.bcc.map((email, idx) => (
                      <div key={idx} className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">From:</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                  {selectedEmail.from}
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          {selectedEmail.contact && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedEmail.contact.firstName} {selectedEmail.contact.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedEmail.contact.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Sender Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sender</h2>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedEmail.sender.name}</p>
                <p className="text-sm text-gray-600">{selectedEmail.sender.email}</p>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedEmail.createdAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {selectedEmail.sentAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-600">Sent</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(selectedEmail.sentAt), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {selectedEmail.template && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-600">Template</p>
                    <p className="font-medium text-gray-900">{selectedEmail.template.name}</p>
                    <p className="text-gray-600 text-xs">{selectedEmail.template.category}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={replyType === 'reply' ? 'Reply' : 'Reply All'}
        size="full"
      >
        <EmailComposer
          onSend={handleSendReply}
          onCancel={() => setIsReplyModalOpen(false)}
          initialTo={getReplyTo()}
          initialCc={getReplyCc()}
          initialSubject={getReplySubject()}
          initialBody={getReplyBody()}
        />
      </Modal>
    </div>
  );
}
