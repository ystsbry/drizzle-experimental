import { relations } from 'drizzle-orm';
import { boolean, date, index, integer, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { companies } from '../companies/companies.table';

export const departmentEnum = pgEnum('department', ['engineering', 'sales', 'marketing', 'hr', 'finance']);

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phoneNumber: varchar('phone_number', { length: 20 }),
    department: departmentEnum('department').notNull(),
    position: varchar('position', { length: 100 }).notNull(),
    hireDate: date('hire_date').notNull(),
    salary: integer('salary').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onUpdate: 'cascade', onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('employees_company_id_idx').on(t.companyId)],
);

export const employeesRelations = relations(employees, ({ one }) => ({
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
}));
