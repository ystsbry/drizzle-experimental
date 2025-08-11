import { boolean, date, integer, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const departmentEnum = pgEnum('department', ['engineering', 'sales', 'marketing', 'hr', 'finance']);

export const employees = pgTable('employees', {
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
