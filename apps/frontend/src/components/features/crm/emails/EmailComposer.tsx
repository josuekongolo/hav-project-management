import { useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { Textarea } from '../../../ui/Textarea';
import { useEmailTemplateStore } from '../../../../store/emailTemplateStore';
import { useContactStore } from '../../../../store/contactStore';
import { SendEmailData, SendEmailWithTemplateData } from '../../../../services/emailService';
import { Send, Save, X } from 'lucide-react';

interface EmailComposerProps {
  onSend: (data: SendEmailData | SendEmailWithTemplateData, useTemplate: boolean) => Promise<void>;
  onSaveDraft?: (data: SendEmailData) => Promise<void>;
  onCancel: () => void;
  initialContactId?: string;
}

export function EmailComposer({ onSend, onSaveDraft, onCancel, initialContactId }: EmailComposerProps) {
  const { templates, fetchTemplates } = useEmailTemplateStore();
  const { contacts, fetchContacts } = useContactStore();

  const [isLoading, setIsLoading] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    contactId: initialContactId || '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  const [variables, setVariables] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
  }, [fetchTemplates, fetchContacts]);

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      setSelectedTemplate(template);

      if (template) {
        setFormData((prev) => ({
          ...prev,
          subject: template.subject,
          body: template.body,
        }));

        // Initialize variables
        const initialVars: { [key: string]: string } = {};
        template.variables.forEach((v: string) => {
          initialVars[v] = '';
        });
        setVariables(initialVars);
      }
    }
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (formData.contactId) {
      const contact = contacts.find((c) => c.id === formData.contactId);
      if (contact) {
        setFormData((prev) => ({
          ...prev,
          to: contact.email,
        }));

        // Auto-fill contact variables
        if (selectedTemplate) {
          setVariables((prev) => ({
            ...prev,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            company: contact.company || '',
          }));
        }
      }
    }
  }, [formData.contactId, contacts, selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (useTemplate && selectedTemplateId) {
        await onSend(
          {
            contactId: formData.contactId || undefined,
            to: formData.to,
            cc: formData.cc ? formData.cc.split(',').map((e) => e.trim()) : undefined,
            bcc: formData.bcc ? formData.bcc.split(',').map((e) => e.trim()) : undefined,
            templateId: selectedTemplateId,
            variables,
          },
          true
        );
      } else {
        await onSend(
          {
            contactId: formData.contactId || undefined,
            to: formData.to,
            cc: formData.cc ? formData.cc.split(',').map((e) => e.trim()) : undefined,
            bcc: formData.bcc ? formData.bcc.split(',').map((e) => e.trim()) : undefined,
            subject: formData.subject,
            body: formData.body,
          },
          false
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsLoading(true);
    try {
      await onSaveDraft({
        contactId: formData.contactId || undefined,
        to: formData.to,
        cc: formData.cc ? formData.cc.split(',').map((e) => e.trim()) : undefined,
        bcc: formData.bcc ? formData.bcc.split(',').map((e) => e.trim()) : undefined,
        subject: formData.subject,
        body: formData.body,
        templateId: useTemplate ? selectedTemplateId : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template Toggle */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="useTemplate"
          checked={useTemplate}
          onChange={(e) => setUseTemplate(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">
          Use email template
        </label>
      </div>

      {/* Template Selection */}
      {useTemplate && (
        <Select
          label="Email Template"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          options={[
            { value: '', label: 'Select a template' },
            ...templates
              .filter((t) => t.isActive)
              .map((t) => ({ value: t.id, label: t.name })),
          ]}
          required={useTemplate}
        />
      )}

      {/* Contact Selection */}
      <Select
        label="Contact (Optional)"
        value={formData.contactId}
        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
        options={[
          { value: '', label: 'No contact' },
          ...contacts.map((c) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName} (${c.email})`,
          })),
        ]}
      />

      {/* Recipient */}
      <Input
        label="To"
        type="email"
        value={formData.to}
        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
        required
        placeholder="recipient@example.com"
      />

      {/* CC & BCC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="CC (Optional)"
          value={formData.cc}
          onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
          placeholder="cc1@example.com, cc2@example.com"
        />
        <Input
          label="BCC (Optional)"
          value={formData.bcc}
          onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
          placeholder="bcc1@example.com, bcc2@example.com"
        />
      </div>

      {/* Variables (if using template) */}
      {useTemplate && selectedTemplate && selectedTemplate.variables.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Template Variables</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedTemplate.variables.map((variable: string) => (
              <Input
                key={variable}
                label={`{{${variable}}}`}
                value={variables[variable] || ''}
                onChange={(e) =>
                  setVariables({ ...variables, [variable]: e.target.value })
                }
                placeholder={`Enter ${variable}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subject */}
      <Input
        label="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
        disabled={useTemplate && selectedTemplate}
        placeholder="Email subject"
      />

      {/* Body */}
      <Textarea
        label="Message"
        value={formData.body}
        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        rows={12}
        required
        disabled={useTemplate && selectedTemplate}
        placeholder="Write your message here..."
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        {onSaveDraft && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send Email'}
        </Button>
      </div>
    </form>
  );
}
