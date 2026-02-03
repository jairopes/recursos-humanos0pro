
import { Employee, MonthlyLaunch, Advance, HRService } from './types';

const EMPLOYEES_KEY = 'rh_employees_data';
const LAUNCHES_KEY = 'rh_launches_data';
const ADVANCES_KEY = 'rh_advances_data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStored = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStored = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockService: HRService = {
  async validateLogin(email: string) {
    await delay(500);
    const emps = getStored<Employee>(EMPLOYEES_KEY);
    return emps.find(e => e.email === email) || null;
  },

  async getEmployees() {
    await delay(400);
    return getStored<Employee>(EMPLOYEES_KEY);
  },

  async createEmployee(data) {
    await delay(600);
    const employees = getStored<Employee>(EMPLOYEES_KEY);
    const newEmployee: Employee = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      defaultMealVoucher: data.defaultMealVoucher || 0,
      defaultFoodVoucher: data.defaultFoodVoucher || 0,
    };
    setStored(EMPLOYEES_KEY, [newEmployee, ...employees]);
    return newEmployee;
  },

  async updateEmployee(id, data) {
    await delay(600);
    const employees = getStored<Employee>(EMPLOYEES_KEY);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    employees[index] = { ...employees[index], ...data };
    setStored(EMPLOYEES_KEY, employees);
    return employees[index];
  },

  async deleteEmployee(id) {
    await delay(500);
    const employees = getStored<Employee>(EMPLOYEES_KEY);
    setStored(EMPLOYEES_KEY, employees.filter(e => e.id !== id));
  },

  async getLaunches() {
    await delay(400);
    return getStored<MonthlyLaunch>(LAUNCHES_KEY);
  },

  async createLaunch(data) {
    await delay(600);
    const launches = getStored<MonthlyLaunch>(LAUNCHES_KEY);
    
    const totalEarnings = Number(data.baseSalary) + 
                          Number(data.functionBonus) + 
                          Number(data.otherEarnings) + 
                          Number(data.premiumAmount) + 
                          Number(data.basicBasket) +
                          Number(data.mealVoucher) +
                          Number(data.foodVoucher);
                          
    const totalDeductions = Number(data.advances) + 
                            Number(data.medicalConvenio) + 
                            Number(data.dentalConvenio) + 
                            Number(data.pharmacyConvenio) + 
                            Number(data.otherConvenios) + 
                            Number(data.transportVoucherValue) +
                            Number(data.loans) +
                            Number(data.absences);
    
    const netSalary = totalEarnings - totalDeductions;

    const newLaunch: MonthlyLaunch = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      totalEarnings,
      totalDeductions,
      netSalary,
      createdAt: new Date().toISOString()
    };
    
    setStored(LAUNCHES_KEY, [newLaunch, ...launches]);
    return newLaunch;
  },

  async updateLaunch(id, data) {
    await delay(600);
    const launches = getStored<MonthlyLaunch>(LAUNCHES_KEY);
    const index = launches.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Launch not found');

    const updated = { ...launches[index], ...data };
    
    updated.totalEarnings = Number(updated.baseSalary) + Number(updated.functionBonus) + 
                            Number(updated.otherEarnings) + Number(updated.premiumAmount) + 
                            Number(updated.basicBasket) + Number(updated.mealVoucher) + 
                            Number(updated.foodVoucher);

    updated.totalDeductions = Number(updated.advances) + Number(updated.medicalConvenio) + 
                            Number(updated.dentalConvenio) + Number(updated.pharmacyConvenio) + 
                            Number(updated.otherConvenios) + Number(updated.transportVoucherValue) + 
                            Number(updated.loans) + Number(updated.absences);

    updated.netSalary = updated.totalEarnings - updated.totalDeductions;

    launches[index] = updated;
    setStored(LAUNCHES_KEY, launches);
    return updated;
  },

  async deleteLaunch(id) {
    await delay(500);
    const launches = getStored<MonthlyLaunch>(LAUNCHES_KEY);
    setStored(LAUNCHES_KEY, launches.filter(l => l.id !== id));
  },

  async getAdvancesByPeriod(period: string) {
    await delay(300);
    const all = getStored<Advance>(ADVANCES_KEY);
    return all.filter(a => a.period === period);
  },

  async saveAdvances(newAdvances) {
    await delay(800);
    const stored = getStored<Advance>(ADVANCES_KEY);
    const period = newAdvances[0]?.period;
    
    const filtered = stored.filter(a => a.period !== period);
    
    const prepared = newAdvances.map(a => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }));
    
    setStored(ADVANCES_KEY, [...filtered, ...prepared]);
  },

  async bulkUpdateVouchers(meal, food) {
    await delay(1000);
    const employees = getStored<Employee>(EMPLOYEES_KEY);
    const updated = employees.map(e => ({
      ...e,
      defaultMealVoucher: meal,
      defaultFoodVoucher: food
    }));
    setStored(EMPLOYEES_KEY, updated);
  }
};
