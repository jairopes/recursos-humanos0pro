
export interface Employee {
  id: string;
  name: string;
  email: string; // Novo campo para login
  role: string;
  hireDate: string;
  exitDate?: string; // Novo campo
  birthDate: string;
  company: string;
  address: string;
  phone: string;
  city: string;
  state: string;
  cep: string;
  fatherName: string;
  motherName: string;
  cpf: string;
  rg: string;
  ctps: string;
  pis: string;
  voterId: string;
  baseSalary: number;
  functionBonus: number;
  defaultMealVoucher: number;
  defaultFoodVoucher: number;
  notes?: string; // Novo campo
  createdAt?: string;
}

export interface MonthlyLaunch {
  id: string;
  employeeId: string;
  employeeName: string;
  closingDate: string;
  baseSalary: number;
  functionBonus: number;
  otherEarnings: number;
  premiumAmount: number;
  basicBasket: number;
  extraHours100: number;
  extraHours70: number;
  extraHours50: number;
  hasTransportVoucher: boolean;
  transportVoucherValue: number;

  advances: number;
  mealVoucher: number;
  foodVoucher: number;
  medicalConvenio: number;
  dentalConvenio: number;
  pharmacyConvenio: number;
  otherConvenios: number;
  absences: number;
  loans: number;
  otherDiscounts: string;
  notes: string;

  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  createdAt?: string;
}

export interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM
  baseSalary: number;
  functionBonus: number;
  standardAdvance: number; // 40% fixed
  otherAdvances: number; // variable
  totalAdvance: number;
  createdAt?: string;
}

export interface HRService {
  getEmployees(): Promise<Employee[]>;
  createEmployee(data: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee>;
  updateEmployee(id: string, data: Partial<Employee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  getLaunches(): Promise<MonthlyLaunch[]>;
  createLaunch(data: Omit<MonthlyLaunch, 'id' | 'createdAt' | 'totalEarnings' | 'totalDeductions' | 'netSalary'>): Promise<MonthlyLaunch>;
  updateLaunch(id: string, data: Partial<MonthlyLaunch>): Promise<MonthlyLaunch>;
  deleteLaunch(id: string): Promise<void>;

  getAdvancesByPeriod(period: string): Promise<Advance[]>;
  saveAdvances(advances: Omit<Advance, 'id' | 'createdAt'>[]): Promise<void>;
  
  bulkUpdateVouchers(meal: number, food: number): Promise<void>;
  
  // Novo método para validação de login
  validateLogin(email: string): Promise<Employee | null>;
}
