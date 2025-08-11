import { createSchemaFactory } from 'drizzle-zod';
import type * as Z from 'zod';
import { z } from 'zod';
import { employees } from './employees.table';

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

const phoneRe = /^[0-9+\-() ]{7,20}$/;

export const employeeInsert = insertCoerce(employees, {
  firstName: (s) => s.min(1).max(50).trim(),
  lastName: (s) => s.min(1).max(50).trim(),
  email: (s) => s.email(),
  phoneNumber: (s) => s.regex(phoneRe).optional(),
  position: (s) => s.min(1).max(100).trim(),
  salary: (s) => s.int().min(0),
});

export const employeeSelect = selectCoerce(employees, {
  firstName: (s) => s.min(1).max(50),
  lastName: (s) => s.min(1).max(50),
  email: (_) => z.email(),
  phoneNumber: (s) => s.regex(phoneRe).nullable().or(z.undefined()),
  position: (s) => s.min(1).max(100),
  salary: (s) => s.int().min(0),
});

export const employeeUpdate = updateCoerce(employees, {
  firstName: (s) => s.min(1).max(50).trim(),
  lastName: (s) => s.min(1).max(50).trim(),
  email: (s) => s.email(),
  phoneNumber: (s) => s.regex(phoneRe),
  position: (s) => s.min(1).max(100).trim(),
  salary: (s) => s.int().min(0),
});

export const EmployeeDeleteSchema = z.object({
  id: z.uuid(),
});

export type EmployeeInsert = z.infer<typeof employeeInsert>;
export type EmployeeSelect = z.infer<typeof employeeSelect>;
export type EmployeeUpdate = z.infer<typeof employeeUpdate>;
export type EmployeeDelete = Z.infer<typeof EmployeeDeleteSchema>;
