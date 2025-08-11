import { eq } from 'drizzle-orm';
import { closeDb, db } from '../db/client';
import { companies, employees } from '../db/schema';
import {
  companyInsert,
  companyUpdate,
  CompanyDeleteSchema,
  CompanyIdSchema,
  CompanySlugSchema,
  type CompanyInsert,
  type CompanyUpdate,
} from '../db/schema/companies/companies.zod';
import {
  employeeSelect,
  type EmployeeSelect,
} from '../db/schema/employees/employees.zod';

export async function createCompany(data: CompanyInsert) {
  try {
    const validatedData = companyInsert.parse(data);
    const result = await db
      .insert(companies)
      .values(validatedData)
      .returning();

    console.log('Company created successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getAllCompanies() {
  try {
    const result = await db.select().from(companies);
    console.log(`Found ${result.length} companies`);
    return result;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getCompanyById(id: string) {
  try {
    const { id: validatedId } = CompanyIdSchema.parse({ id });
    const result = await db.select().from(companies).where(eq(companies.id, validatedId));

    if (result.length === 0) {
      console.log(`No company found with id: ${validatedId}`);
      return null;
    }

    console.log('Company found:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getCompanyBySlug(slug: string) {
  try {
    const { slug: validatedSlug } = CompanySlugSchema.parse({ slug });
    const result = await db.select().from(companies).where(eq(companies.slug, validatedSlug));

    if (result.length === 0) {
      console.log(`No company found with slug: ${validatedSlug}`);
      return null;
    }

    console.log('Company found:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

type CompanyWithEmployees =
  typeof companies.$inferSelect & { employees: EmployeeSelect[] };

export async function getCompanyWithEmployees(id: string): Promise<CompanyWithEmployees | null> {
  try {
    const { id: validatedId } = CompanyIdSchema.parse({ id });

    const rows = await db.select().from(companies).where(eq(companies.id, validatedId));
    const company = rows[0];            // まず1件目を取り出す

    if (!company) {                     // 未取得なら早期 return
      console.log(`No company found with id: ${validatedId}`);
      return null;
    }

    const employeesRows = await db
      .select()
      .from(employees)
      .where(eq(employees.companyId, validatedId));

    // （必要なら）Zodでバリデーション
    const validatedEmployees: EmployeeSelect[] =
      employeesRows.map((emp) => employeeSelect.parse(emp));

    // company はここでは undefined ではない
    const result: CompanyWithEmployees = {
      ...company,
      employees: validatedEmployees,
    };

    return result;
  } catch (error) {
    console.error('Error fetching company with employees:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function updateCompany(id: string, data: CompanyUpdate) {
  try {
    const { id: validatedId } = CompanyIdSchema.parse({ id });
    const validatedData = companyUpdate.parse(data);
    
    const updateData: CompanyUpdate & { updatedAt: Date } = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await db.update(companies).set(updateData).where(eq(companies.id, validatedId)).returning();

    if (result.length === 0) {
      console.log(`No company found with id: ${validatedId}`);
      return null;
    }

    console.log('Company updated successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function deleteCompany(id: string) {
  try {
    const { id: validatedId } = CompanyDeleteSchema.parse({ id });
    const employeeCount = await db.select({ count: employees.id }).from(employees).where(eq(employees.companyId, validatedId));

    // biome-ignore lint/style/noNonNullAssertion: Company has employees check ensures safety
    if (employeeCount.length > 0 && employeeCount[0]!.count) {
      console.error(`Cannot delete company with id ${validatedId}: Company has employees`);
      throw new Error('Cannot delete company with existing employees');
    }

    const result = await db.delete(companies).where(eq(companies.id, validatedId)).returning();

    if (result.length === 0) {
      console.log(`No company found with id: ${validatedId}`);
      return null;
    }

    console.log('Company deleted successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getCompanyEmployeeCount(id: string) {
  try {
    const { id: validatedId } = CompanyIdSchema.parse({ id });
    const result = await db
      .select({
        companyId: companies.id,
        companyName: companies.name,
        employeeCount: db.$count(employees.id),
      })
      .from(companies)
      .leftJoin(employees, eq(companies.id, employees.companyId))
      .where(eq(companies.id, validatedId))
      .groupBy(companies.id, companies.name);

    if (result.length === 0) {
      console.log(`No company found with id: ${validatedId}`);
      return null;
    }

    if (result[0]) {
      console.log(`Company ${result[0].companyName} has ${result[0].employeeCount} employees`);
    } else {
      console.log('No company data found');
    }
    return result[0];
  } catch (error) {
    console.error('Error fetching company employee count:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getAllCompaniesWithEmployeeCount() {
  try {
    const result = await db
      .select({
        companyId: companies.id,
        companyName: companies.name,
        companySlug: companies.slug,
        companyDomain: companies.domain,
        employeeCount: db.$count(employees.id),
      })
      .from(companies)
      .leftJoin(employees, eq(companies.id, employees.companyId))
      .groupBy(companies.id, companies.name, companies.slug, companies.domain);

    console.log(`Found ${result.length} companies with employee counts`);
    return result;
  } catch (error) {
    console.error('Error fetching companies with employee count:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

if (import.meta.main) {
  const action = Bun.argv[2];

  switch (action) {
    case 'create': {
      const randomNum = Math.floor(Math.random() * 10000);
      try {
        await createCompany({
          name: `Tech Corp ${randomNum}`,
          slug: `tech-corp-${randomNum}`,
          domain: `techcorp${randomNum}.com`,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Validation or database error:', error.message);
        }
      }
      break;
    }

    case 'read-all': {
      const allCompanies = await getAllCompanies();
      console.table(allCompanies);
      break;
    }

    case 'read-id': {
      const id = Bun.argv[3];
      if (!id) {
        console.error('Please provide a company ID');
        process.exit(1);
      }
      await getCompanyById(id);
      break;
    }

    case 'read-slug': {
      const slug = Bun.argv[3];
      if (!slug) {
        console.error('Please provide a company slug');
        process.exit(1);
      }
      await getCompanyBySlug(slug);
      break;
    }

    case 'read-with-employees': {
      const id = Bun.argv[3];
      if (!id) {
        console.error('Please provide a company ID');
        process.exit(1);
      }
      const companyWithEmployees = await getCompanyWithEmployees(id);
      if (companyWithEmployees) {
        console.log('Company:', companyWithEmployees);
        console.table(companyWithEmployees.employees);
      }
      break;
    }

    case 'update': {
      const updateId = Bun.argv[3];
      if (!updateId) {
        console.error('Please provide a company ID');
        process.exit(1);
      }
      try {
        await updateCompany(updateId, {
          name: 'Updated Tech Corp',
          domain: 'updatedtechcorp.com',
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Validation or database error:', error.message);
        }
      }
      break;
    }

    case 'delete': {
      const deleteId = Bun.argv[3];
      if (!deleteId) {
        console.error('Please provide a company ID');
        process.exit(1);
      }
      await deleteCompany(deleteId);
      break;
    }

    case 'employee-count': {
      const id = Bun.argv[3];
      if (!id) {
        console.error('Please provide a company ID');
        process.exit(1);
      }
      await getCompanyEmployeeCount(id);
      break;
    }

    case 'all-with-count': {
      const companiesWithCount = await getAllCompaniesWithEmployeeCount();
      console.table(companiesWithCount);
      break;
    }

    default:
      console.log(`
Usage:
  bun src/cmd/companies.ts create                    - Create a sample company
  bun src/cmd/companies.ts read-all                  - Get all companies
  bun src/cmd/companies.ts read-id <id>              - Get company by ID
  bun src/cmd/companies.ts read-slug <slug>          - Get company by slug
  bun src/cmd/companies.ts read-with-employees <id>  - Get company with all its employees
  bun src/cmd/companies.ts update <id>               - Update company (sample update)
  bun src/cmd/companies.ts delete <id>               - Delete company (only if no employees)
  bun src/cmd/companies.ts employee-count <id>       - Get employee count for a company
  bun src/cmd/companies.ts all-with-count            - Get all companies with employee counts
      `);
  }
}