import { useState, useEffect } from 'react';
import {
  EmailTemplate,
  EmailTemplateCategory,
  CreateEmailTemplateData,
  UpdateEmailTemplateData,
} from '../../../../services/emailTemplateService';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { RichTextEditor } from '../../../ui/RichTextEditor';
import { Info } from 'lucide-react';

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  onSubmit: (data: CreateEmailTemplateData | UpdateEmailTemplateData) => Promise<void>;
  onCancel: () => void;
}

export function EmailTemplateForm({ template, onSubmit, onCancel }: EmailTemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmailTemplateData>({
    name: '',
    subject: '',
    body: '',
    htmlBody: '',
    category: EmailTemplateCategory.GENERAL,
    isActive: true,
  });

  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        htmlBody: template.htmlBody || '',
        category: template.category,
        isActive: template.isActive,
      });
    } else {
      // Reset form when no template (creating new)
      setFormData({
        name: '',
        subject: '',
        body: '',
        htmlBody: '',
        category: EmailTemplateCategory.GENERAL,
        isActive: true,
      });
    }
  }, [template]);

  useEffect(() => {
    // Extract variables from htmlBody (which contains the rich text)
    const regex = /{{(\w+)}}/g;
    const matches = (formData.htmlBody || '').matchAll(regex);
    const variables = new Set<string>();

    for (const match of matches) {
      variables.add(match[1]);
    }

    setDetectedVariables(Array.from(variables));
  }, [formData.htmlBody]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Convert HTML to plain text for body
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.htmlBody || '';
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Remove empty optional fields
      const cleanedData: any = {
        ...formData,
        body: plainText || formData.body, // Use plain text extracted from HTML
      };
      if (!cleanedData.htmlBody || cleanedData.htmlBody === '') {
        delete cleanedData.htmlBody;
      }
      await onSubmit(cleanedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Welcome Email"
        />
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as EmailTemplateCategory })
          }
          options={[
            { value: EmailTemplateCategory.WELCOME, label: 'Welcome' },
            { value: EmailTemplateCategory.FOLLOW_UP, label: 'Follow-up' },
            { value: EmailTemplateCategory.PROPOSAL, label: 'Proposal' },
            { value: EmailTemplateCategory.INVOICE, label: 'Invoice' },
            { value: EmailTemplateCategory.GENERAL, label: 'General' },
          ]}
        />
      </div>

      <Input
        label="Email Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
        placeholder="e.g., Welcome to {{company}}!"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Body <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={formData.htmlBody || ''}
          onChange={(value) => setFormData({ ...formData, htmlBody: value, body: value })}
          placeholder="Hi {{firstName}}, Welcome to our platform!"
        />
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Variable Syntax</p>
              <p className="mb-2">
                Use <code className="bg-blue-100 px-1 rounded">{`{{variableName}}`}</code> to insert
                dynamic values.
              </p>
              {detectedVariables.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Detected Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {detectedVariables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-900"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active (available for use)
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
