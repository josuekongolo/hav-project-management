import { useState, useEffect } from 'react';
import { useEmailTemplateStore } from '../../../../store/emailTemplateStore';
import { useEmailStore } from '../../../../store/emailStore';
import { Contact } from '../../../../services/contactService';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Select';
import { Card } from '../../../ui/Card';
import { Users, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkEmailDialogProps {
  contacts: Contact[];
  onClose: () => void;
}

export function BulkEmailDialog({ contacts, onClose }: BulkEmailDialogProps) {
  const { templates, fetchTemplates } = useEmailTemplateStore();
  const { sendBulkEmails, isLoading } = useEmailStore();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error('Please select an email template');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendBulkEmails({
        contactIds: contacts.map((c) => c.id),
        templateId: selectedTemplate,
      });

      setResults(result);

      if (result.failed === 0) {
        toast.success(`Successfully sent ${result.sent} emails!`);
      } else {
        toast.error(`Sent ${result.sent} emails, ${result.failed} failed`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send bulk emails');
    } finally {
      setIsSending(false);
    }
  };

  const activeTemplates = templates.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      {!results ? (
        <>
          {/* Recipients Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  {contacts.length} recipient{contacts.length !== 1 ? 's' : ''} selected
                </h3>
                <p className="text-sm text-blue-700">
                  {contacts.slice(0, 3).map((c) => `${c.firstName} ${c.lastName}`).join(', ')}
                  {contacts.length > 3 && ` and ${contacts.length - 3} more`}
                </p>
              </div>
            </div>
          </Card>

          {/* Template Selection */}
          <div>
            <Select
              label="Email Template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              options={[
                { value: '', label: 'Select a template' },
                ...activeTemplates.map((template) => ({
                  value: template.id,
                  label: `${template.name} (${template.category})`,
                })),
              ]}
              required
            />

            {selectedTemplate && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview</h4>
                {(() => {
                  const template = templates.find((t) => t.id === selectedTemplate);
                  return template ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">{template.subject}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{template.body}</p>
                      {template.variables.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">
                            Variables: {template.variables.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            These will be automatically filled for each contact
                          </p>
                        </div>
                      )}
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedTemplate || isSending}
              isLoading={isSending}
            >
              {isSending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send to {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results Display */}
          <div className="space-y-4">
            <div className="text-center">
              {results.failed === 0 ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              )}
              <h3 className="text-2xl font-bold text-gray-900">Bulk Email Complete</h3>
              <p className="text-gray-600 mt-2">
                {results.failed === 0
                  ? 'All emails were sent successfully!'
                  : 'Some emails encountered issues'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center bg-blue-50">
                <p className="text-3xl font-bold text-blue-900">{results.total}</p>
                <p className="text-sm text-blue-700 mt-1">Total</p>
              </Card>
              <Card className="text-center bg-green-50">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <p className="text-3xl font-bold text-green-900">{results.sent}</p>
                </div>
                <p className="text-sm text-green-700 mt-1">Sent</p>
              </Card>
              <Card className="text-center bg-red-50">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <p className="text-3xl font-bold text-red-900">{results.failed}</p>
                </div>
                <p className="text-sm text-red-700 mt-1">Failed</p>
              </Card>
            </div>

            {/* Errors */}
            {results.errors && results.errors.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                <div className="space-y-1">
                  {results.errors.map((err: any, idx: number) => {
                    const contact = contacts.find((c) => c.id === err.contactId);
                    return (
                      <p key={idx} className="text-sm text-red-800">
                        {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown'}: {err.error}
                      </p>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </>
      )}
    </div>
  );
}
