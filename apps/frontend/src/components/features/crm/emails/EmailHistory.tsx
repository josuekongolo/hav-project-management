import { Email, EmailStatus } from '../../../../services/emailService';
import { Mail, Trash2, Clock, CheckCircle, XCircle, Eye, MousePointer } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { format } from 'date-fns';

interface EmailHistoryProps {
  emails: Email[];
  onDeleteEmail: (id: string) => void;
}

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

export function EmailHistory({ emails, onDeleteEmail }: EmailHistoryProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No emails yet</h3>
        <p className="mt-1 text-sm text-gray-500">Start by composing your first email.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => {
        const StatusIcon = statusIcons[email.status];
        return (
          <Card key={email.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{email.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>To: {email.to.join(', ')}</span>
                    {email.contact && (
                      <>
                        <span>•</span>
                        <span>
                          {email.contact.firstName} {email.contact.lastName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {(email.status === EmailStatus.DRAFT || email.status === EmailStatus.FAILED) && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this email?')) {
                      onDeleteEmail(email.id);
                    }
                  }}
                  className="p-1 hover:bg-red-50 rounded"
                  title="Delete email"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 line-clamp-2">{email.body}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[email.status]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {email.status}
                </Badge>
                {email.template && (
                  <Badge className="bg-blue-50 text-blue-700">
                    Template: {email.template.name}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {email.sentAt ? (
                  <span>Sent {format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')}</span>
                ) : (
                  <span>Created {format(new Date(email.createdAt), 'MMM d, yyyy h:mm a')}</span>
                )}
              </div>
            </div>

            {email.status === EmailStatus.FAILED && email.errorMessage && (
              <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-800">
                <span className="font-medium">Error:</span> {email.errorMessage}
              </div>
            )}

            {email.openedAt && (
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Opened {format(new Date(email.openedAt), 'MMM d, h:mm a')}
                </span>
                {email.clickedAt && (
                  <span className="flex items-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    Clicked {format(new Date(email.clickedAt), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
