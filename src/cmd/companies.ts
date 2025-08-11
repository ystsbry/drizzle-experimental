import { eq } from 'drizzle-orm';
import { closeDb, db } from '../db/client';
import { companies, employees } from '../db/schema';

interface CreateCompanyData {
  name: string;
  slug: string;
  domain?: string;
}

interface UpdateCompanyData {
  name?: string;
  slug?: string;
  domain?: string | null;
}

export async function createCompany(data: CreateCompanyData) {
  try {
    const result = await db
      .insert(companies)
      .values({
        name: data.name,
        slug: data.slug,
        domain: data.domain || null,
      })
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
    const result = await db.select().from(companies).where(eq(companies.id, id));

    if (result.length === 0) {
      console.log(`No company found with id: ${id}`);
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
    const result = await db.select().from(companies).where(eq(companies.slug, slug));

    if (result.length === 0) {
      console.log(`No company found with slug: ${slug}`);
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

export async function getCompanyWithEmployees(id: string) {
  try {
    const companyResult = await db.select().from(companies).where(eq(companies.id, id));

    if (companyResult.length === 0) {
      console.log(`No company found with id: ${id}`);
      return null;
    }

    const employeesResult = await db.select().from(employees).where(eq(employees.companyId, id));

    const result = {
      ...companyResult[0],
      employees: employeesResult,
    };

    console.log(`Company found with ${employeesResult.length} employees`);
    return result;
  } catch (error) {
    console.error('Error fetching company with employees:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function updateCompany(id: string, data: UpdateCompanyData) {
  try {
    const updateData: Partial<UpdateCompanyData & { updatedAt?: Date }> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.domain !== undefined) updateData.domain = data.domain;

    updateData.updatedAt = new Date();

    const result = await db.update(companies).set(updateData).where(eq(companies.id, id)).returning();

    if (result.length === 0) {
      console.log(`No company found with id: ${id}`);
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
    const employeeCount = await db.select({ count: employees.id }).from(employees).where(eq(employees.companyId, id));

    if (employeeCount.length > 0 && employeeCount[0].count) {
      console.error(`Cannot delete company with id ${id}: Company has employees`);
      throw new Error('Cannot delete company with existing employees');
    }

    const result = await db.delete(companies).where(eq(companies.id, id)).returning();

    if (result.length === 0) {
      console.log(`No company found with id: ${id}`);
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
    const result = await db
      .select({
        companyId: companies.id,
        companyName: companies.name,
        employeeCount: db.$count(employees.id),
      })
      .from(companies)
      .leftJoin(employees, eq(companies.id, employees.companyId))
      .where(eq(companies.id, id))
      .groupBy(companies.id, companies.name);

    if (result.length === 0) {
      console.log(`No company found with id: ${id}`);
      return null;
    }

    console.log(`Company ${result[0].companyName} has ${result[0].employeeCount} employees`);
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
      await createCompany({
        name: `Tech Corp ${randomNum}`,
        slug: `tech-corp-${randomNum}`,
        domain: `techcorp${randomNum}.com`,
      });
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
      await updateCompany(updateId, {
        name: 'Updated Tech Corp',
        domain: 'updatedtechcorp.com',
      });
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