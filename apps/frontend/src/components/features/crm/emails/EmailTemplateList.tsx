import { EmailTemplate, EmailTemplateCategory } from '../../../../services/emailTemplateService';
import { Mail, Trash2, Eye, Edit } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface EmailTemplateListProps {
  templates: EmailTemplate[];
  onTemplateClick: (template: EmailTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const categoryColors: Record<EmailTemplateCategory, string> = {
  [EmailTemplateCategory.WELCOME]: 'bg-green-100 text-green-800',
  [EmailTemplateCategory.FOLLOW_UP]: 'bg-blue-100 text-blue-800',
  [EmailTemplateCategory.PROPOSAL]: 'bg-purple-100 text-purple-800',
  [EmailTemplateCategory.INVOICE]: 'bg-yellow-100 text-yellow-800',
  [EmailTemplateCategory.GENERAL]: 'bg-gray-100 text-gray-800',
};

const categoryLabels: Record<EmailTemplateCategory, string> = {
  [EmailTemplateCategory.WELCOME]: 'Welcome',
  [EmailTemplateCategory.FOLLOW_UP]: 'Follow-up',
  [EmailTemplateCategory.PROPOSAL]: 'Proposal',
  [EmailTemplateCategory.INVOICE]: 'Invoice',
  [EmailTemplateCategory.GENERAL]: 'General',
};

export function EmailTemplateList({
  templates,
  onTemplateClick,
  onDeleteTemplate,
}: EmailTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No email templates</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="hover:shadow-lg transition-shadow relative group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                <p className="text-sm text-gray-500 truncate">{template.subject}</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onTemplateClick(template)}
                className="p-1 hover:bg-blue-50 rounded"
                title="Edit template"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this template?')) {
                    onDeleteTemplate(template.id);
                  }
                }}
                className="p-1 hover:bg-red-50 rounded"
                title="Delete template"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-3">{template.body}</p>
          </div>

          {template.variables.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.slice(0, 5).map((variable) => (
                  <span
                    key={variable}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700"
                  >
                    {`{{${variable}}}`}
                  </span>
                ))}
                {template.variables.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{template.variables.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Badge className={categoryColors[template.category]}>
              {categoryLabels[template.category]}
            </Badge>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {!template.isActive && (
                <span className="text-red-600 font-medium">Inactive</span>
              )}
              {template._count && template._count.emails > 0 && (
                <span>{template._count.emails} emails sent</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
