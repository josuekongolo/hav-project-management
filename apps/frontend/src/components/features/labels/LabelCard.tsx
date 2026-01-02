import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Label } from '../../../services/taskService';
import { useState } from 'react';

interface LabelCardProps {
  label: Label;
  onEdit: (label: Label) => void;
  onDelete: (id: string) => void;
}

export function LabelCard({ label, onEdit, onDelete }: LabelCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${label.color}20` }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: label.color }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{label.name}</h3>
            <p className="text-sm text-gray-500">{label.color}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onEdit(label);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Label
                </button>
                <button
                  onClick={() => {
                    onDelete(label.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Label
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
