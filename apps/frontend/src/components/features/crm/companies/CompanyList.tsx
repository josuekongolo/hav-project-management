import { Company } from '../../../../services/companyService';
import { Building2, Mail, Phone, Users, DollarSign, MapPin, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/Card';
import { useNavigate } from 'react-router-dom';

interface CompanyListProps {
  companies: Company[];
  onDeleteCompany: (id: string) => void;
}

export function CompanyList({ companies, onDeleteCompany }: CompanyListProps) {
  const navigate = useNavigate();

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new company.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <div
          key={company.id}
          className="cursor-pointer"
          onClick={() => navigate(`/crm/companies/${company.id}`)}
        >
          <Card className="hover:shadow-lg transition-shadow relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {company.name}
                  </h3>
                  {company.industry && (
                    <p className="text-sm text-gray-500 truncate">{company.industry}</p>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this company?')) {
                    onDeleteCompany(company.id);
                  }
                }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 sm:p-1 hover:bg-red-50 rounded flex-shrink-0"
              >
                <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 text-red-600" />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {company.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.city && company.country && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">
                    {company.city}, {company.country}
                  </span>
                </div>
              )}
              {company.employees && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{company.employees.toLocaleString()} employees</span>
                </div>
              )}
              {company.revenue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>${(company.revenue / 1000000).toFixed(1)}M revenue</span>
                </div>
              )}
            </div>

            {company._count && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-3 text-xs text-gray-500">
                  {company._count.contacts > 0 && <span>{company._count.contacts} contacts</span>}
                  {company._count.deals > 0 && <span>{company._count.deals} deals</span>}
                  {company._count.notes > 0 && <span>{company._count.notes} notes</span>}
                </div>
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}
