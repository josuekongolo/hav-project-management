import { api } from './api';

export type EntityType = 'contacts' | 'companies' | 'deals' | 'tasks';

export interface ParsedCSV {
  headers: string[];
  preview: Record<string, string>[];
  totalRows: number;
}

export interface ImportError {
  row: number;
  data: Record<string, string>;
  errors: string[];
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}

export interface EntityField {
  key: string;
  label: string;
  required: boolean;
}

export interface ColumnMapping {
  [dbField: string]: string;
}

export const importService = {
  async previewCSV(file: File): Promise<ParsedCSV> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ParsedCSV>('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async importContacts(
    data: Record<string, string>[],
    mapping: ColumnMapping
  ): Promise<ImportResult> {
    const response = await api.post<ImportResult>('/import/contacts', {
      data,
      mapping,
    });
    return response.data;
  },

  async importCompanies(
    data: Record<string, string>[],
    mapping: ColumnMapping
  ): Promise<ImportResult> {
    const response = await api.post<ImportResult>('/import/companies', {
      data,
      mapping,
    });
    return response.data;
  },

  async importDeals(
    data: Record<string, string>[],
    mapping: ColumnMapping
  ): Promise<ImportResult> {
    const response = await api.post<ImportResult>('/import/deals', {
      data,
      mapping,
    });
    return response.data;
  },

  async importTasks(
    data: Record<string, string>[],
    mapping: ColumnMapping
  ): Promise<ImportResult> {
    const response = await api.post<ImportResult>('/import/tasks', {
      data,
      mapping,
    });
    return response.data;
  },

  async getEntityFields(entity: EntityType): Promise<{ fields: EntityField[] }> {
    const response = await api.get<{ fields: EntityField[] }>(
      `/import/fields/${entity}`
    );
    return response.data;
  },

  getTemplateUrl(entity: EntityType): string {
    return `${api.defaults.baseURL}/import/template/${entity}`;
  },

  async importEntity(
    entity: EntityType,
    data: Record<string, string>[],
    mapping: ColumnMapping
  ): Promise<ImportResult> {
    switch (entity) {
      case 'contacts':
        return this.importContacts(data, mapping);
      case 'companies':
        return this.importCompanies(data, mapping);
      case 'deals':
        return this.importDeals(data, mapping);
      case 'tasks':
        return this.importTasks(data, mapping);
      default:
        throw new Error(`Invalid entity type: ${entity}`);
    }
  },
};
