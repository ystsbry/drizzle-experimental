import { eq } from 'drizzle-orm';
import { closeDb, db } from '../db/client';
import { employees } from '../db/schema';

interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department: 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance';
  position: string;
  hireDate: string;
  salary: number;
  isActive?: boolean;
}

interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  department?: 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance';
  position?: string;
  hireDate?: string;
  salary?: number;
  isActive?: boolean;
}

export async function createEmployee(data: CreateEmployeeData) {
  try {
    const result = await db
      .insert(employees)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        department: data.department,
        position: data.position,
        hireDate: data.hireDate,
        salary: data.salary,
        isActive: data.isActive ?? true,
      })
      .returning();

    console.log('Employee created successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getAllEmployees() {
  try {
    const result = await db.select().from(employees);
    console.log(`Found ${result.length} employees`);
    return result;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getEmployeeById(id: string) {
  try {
    const result = await db.select().from(employees).where(eq(employees.id, id));

    if (result.length === 0) {
      console.log(`No employee found with id: ${id}`);
      return null;
    }

    console.log('Employee found:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getEmployeeByEmail(email: string) {
  try {
    const result = await db.select().from(employees).where(eq(employees.email, email));

    if (result.length === 0) {
      console.log(`No employee found with email: ${email}`);
      return null;
    }

    console.log('Employee found:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function updateEmployee(id: string, data: UpdateEmployeeData) {
  try {
    const updateData: Partial<UpdateEmployeeData & { updatedAt?: Date }> = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.hireDate !== undefined) updateData.hireDate = data.hireDate;
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    updateData.updatedAt = new Date();

    const result = await db.update(employees).set(updateData).where(eq(employees.id, id)).returning();

    if (result.length === 0) {
      console.log(`No employee found with id: ${id}`);
      return null;
    }

    console.log('Employee updated successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function deleteEmployee(id: string) {
  try {
    const result = await db.delete(employees).where(eq(employees.id, id)).returning();

    if (result.length === 0) {
      console.log(`No employee found with id: ${id}`);
      return null;
    }

    console.log('Employee deleted successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function softDeleteEmployee(id: string) {
  try {
    const result = await db
      .update(employees)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();

    if (result.length === 0) {
      console.log(`No employee found with id: ${id}`);
      return null;
    }

    console.log('Employee soft deleted successfully:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error soft deleting employee:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getEmployeesByDepartment(department: 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance') {
  try {
    const result = await db.select().from(employees).where(eq(employees.department, department));

    console.log(`Found ${result.length} employees in ${department} department`);
    return result;
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    throw error;
  } finally {
    await closeDb();
  }
}

export async function getActiveEmployees() {
  try {
    const result = await db.select().from(employees).where(eq(employees.isActive, true));

    console.log(`Found ${result.length} active employees`);
    return result;
  } catch (error) {
    console.error('Error fetching active employees:', error);
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
      await createEmployee({
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith${randomNum}@example.com`,
        phoneNumber: '098-765-4321',
        department: 'sales',
        position: 'Sales Manager',
        hireDate: '2024-03-20',
        salary: 75000,
        isActive: true,
      });
      break;
    }

    case 'read-all': {
      const allEmployees = await getAllEmployees();
      console.table(allEmployees);
      break;
    }

    case 'read-id': {
      const id = Bun.argv[3];
      if (!id) {
        console.error('Please provide an employee ID');
        process.exit(1);
      }
      await getEmployeeById(id);
      break;
    }

    case 'read-email': {
      const email = Bun.argv[3];
      if (!email) {
        console.error('Please provide an email');
        process.exit(1);
      }
      await getEmployeeByEmail(email);
      break;
    }

    case 'update': {
      const updateId = Bun.argv[3];
      if (!updateId) {
        console.error('Please provide an employee ID');
        process.exit(1);
      }
      await updateEmployee(updateId, {
        position: 'Senior Software Engineer',
        salary: 95000,
      });
      break;
    }

    case 'delete': {
      const deleteId = Bun.argv[3];
      if (!deleteId) {
        console.error('Please provide an employee ID');
        process.exit(1);
      }
      await deleteEmployee(deleteId);
      break;
    }

    case 'soft-delete': {
      const softDeleteId = Bun.argv[3];
      if (!softDeleteId) {
        console.error('Please provide an employee ID');
        process.exit(1);
      }
      await softDeleteEmployee(softDeleteId);
      break;
    }

    case 'read-department': {
      const dept = Bun.argv[3] as 'engineering' | 'sales' | 'marketing' | 'hr' | 'finance';
      if (!dept) {
        console.error('Please provide a department');
        process.exit(1);
      }
      const deptEmployees = await getEmployeesByDepartment(dept);
      console.table(deptEmployees);
      break;
    }

    case 'read-active': {
      const activeEmployees = await getActiveEmployees();
      console.table(activeEmployees);
      break;
    }

    default:
      console.log(`
Usage:
  bun src/cmd/employees.ts create                    - Create a sample employee
  bun src/cmd/employees.ts read-all                  - Get all employees
  bun src/cmd/employees.ts read-id <id>              - Get employee by ID
  bun src/cmd/employees.ts read-email <email>        - Get employee by email
  bun src/cmd/employees.ts update <id>               - Update employee (sample update)
  bun src/cmd/employees.ts delete <id>               - Delete employee
  bun src/cmd/employees.ts soft-delete <id>          - Soft delete employee (set isActive to false)
  bun src/cmd/employees.ts read-department <dept>    - Get employees by department
  bun src/cmd/employees.ts read-active               - Get all active employees
      `);
  }
}
