import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import * as companyService from '../services/companyService.js';

export async function getCompanies(req: AuthRequest, res: Response) {
  try {
    const { industry, search, minEmployees, maxEmployees, minRevenue, maxRevenue } = req.query;

    const filters: companyService.CompanyFilters = {};

    if (industry && typeof industry === 'string') {
      filters.industry = industry;
    }

    if (search && typeof search === 'string') {
      filters.search = search;
    }

    if (minEmployees && typeof minEmployees === 'string') {
      filters.minEmployees = parseInt(minEmployees);
    }

    if (maxEmployees && typeof maxEmployees === 'string') {
      filters.maxEmployees = parseInt(maxEmployees);
    }

    if (minRevenue && typeof minRevenue === 'string') {
      filters.minRevenue = parseFloat(minRevenue);
    }

    if (maxRevenue && typeof maxRevenue === 'string') {
      filters.maxRevenue = parseFloat(maxRevenue);
    }

    const companies = await companyService.getCompanies(filters);
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get companies' });
  }
}

export async function getCompanyById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const company = await companyService.getCompanyById(id);
    res.json({ company });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Company not found' });
  }
}

export async function createCompany(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const company = await companyService.createCompany(req.body, userId);
    res.status(201).json({ company });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create company' });
  }
}

export async function updateCompany(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const company = await companyService.updateCompany(id, req.body);
    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update company' });
  }
}

export async function deleteCompany(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const result = await companyService.deleteCompany(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete company' });
  }
}

export async function searchCompanies(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const companies = await companyService.searchCompanies(q);
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to search companies' });
  }
}
