import { createSchemaFactory } from 'drizzle-zod';
import type * as Z from 'zod';
import { z } from 'zod';
import { companies } from './companies.table';

const {
  createInsertSchema: insertCoerce,
  createSelectSchema: selectCoerce,
  createUpdateSchema: updateCoerce,
} = createSchemaFactory({
  coerce: {
    number: true,
    date: true,
    boolean: true,
  },
});

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const domainRe = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

export const companyInsert = insertCoerce(companies, {
  name: (s) => s.min(1).max(120).trim(),
  slug: (s) => s.min(1).max(80).regex(slugRe, 'Slug must be lowercase letters, numbers, and hyphens only'),
  domain: (s) => s.regex(domainRe, 'Invalid domain format').optional(),
});

export const companySelect = selectCoerce(companies, {
  name: (s) => s.min(1).max(120),
  slug: (s) => s.min(1).max(80).regex(slugRe),
  domain: (s) => s.regex(domainRe).nullable().or(z.undefined()),
});

export const companyUpdate = updateCoerce(companies, {
  name: (s) => s.min(1).max(120).trim(),
  slug: (s) => s.min(1).max(80).regex(slugRe, 'Slug must be lowercase letters, numbers, and hyphens only'),
  domain: (s) => s.regex(domainRe, 'Invalid domain format'),
});

export const CompanyDeleteSchema = z.object({
  id: z.uuid(),
});

export const CompanyIdSchema = z.object({
  id: z.uuid(),
});

export const CompanySlugSchema = z.object({
  slug: z.string().min(1).max(80).regex(slugRe),
});

export type CompanyInsert = z.infer<typeof companyInsert>;
export type CompanySelect = z.infer<typeof companySelect>;
export type CompanyUpdate = z.infer<typeof companyUpdate>;
export type CompanyDelete = Z.infer<typeof CompanyDeleteSchema>;
export type CompanyId = Z.infer<typeof CompanyIdSchema>;
export type CompanySlug = Z.infer<typeof CompanySlugSchema>;