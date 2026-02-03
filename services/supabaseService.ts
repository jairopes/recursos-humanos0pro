
import { createClient } from '@supabase/supabase-js';
import { Employee, MonthlyLaunch, Advance, HRService } from './types';

const SUPABASE_URL = 'https://dqhgabaqzeleazkzdrxj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__R0MoyFcpNcmvos9YcKG0w_WhqC1G2-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sanitizeData = (data: any) => {
  const clean: any = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value === "" || value === undefined) {
      clean[key] = null;
    } else if (typeof value === 'number') {
      clean[key] = isNaN(value) ? 0 : value;
    } else {
      clean[key] = value;
    }
  });
  return clean;
};

export const supabaseService: HRService = {
  // --- Auth ---
  async validateLogin(email: string) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      
      if (error) {
        // Se der erro de coluna não existente ou permissão, logamos mas não travamos o app
        console.warn('Aviso na validação de login (pode ser coluna email ausente):', error.message);
        return null;
      }
      return data as Employee | null;
    } catch (e) {
      console.error('Erro crítico no validateLogin:', e);
      return null;
    }
  },

  // --- Employees ---
  async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
    return data as Employee[];
  },

  async createEmployee(data) {
    const cleanData = sanitizeData(data);
    if (cleanData.email) cleanData.email = cleanData.email.toLowerCase().trim();

    const { data: newEmp, error } = await supabase
      .from('employees')
      .insert([cleanData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro detalhado do Supabase ao criar funcionário:', error);
      throw new Error(error.message || 'Falha na inserção do banco de dados');
    }
    return newEmp as Employee;
  },

  async updateEmployee(id, data) {
    const cleanData = sanitizeData(data);
    if (cleanData.email) cleanData.email = cleanData.email.toLowerCase().trim();

    const { data: updatedEmp, error } = await supabase
      .from('employees')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
    return updatedEmp as Employee;
  },

  async deleteEmployee(id) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar funcionário:', error);
      throw error;
    }
  },

  // --- Launches ---
  async getLaunches() {
    const { data, error } = await supabase
      .from('launches')
      .select('*')
      .order('closingDate', { ascending: false });
    
    if (error) throw error;
    return data as MonthlyLaunch[];
  },

  async createLaunch(data) {
    const cleanData = sanitizeData(data);
    
    const totalEarnings = Number(cleanData.baseSalary || 0) + 
                          Number(cleanData.functionBonus || 0) + 
                          Number(cleanData.otherEarnings || 0) + 
                          Number(cleanData.premiumAmount || 0) + 
                          Number(cleanData.basicBasket || 0) +
                          Number(cleanData.mealVoucher || 0) +
                          Number(cleanData.foodVoucher || 0);
                          
    const totalDeductions = Number(cleanData.advances || 0) + 
                            Number(cleanData.medicalConvenio || 0) + 
                            Number(cleanData.dentalConvenio || 0) + 
                            Number(cleanData.pharmacyConvenio || 0) + 
                            Number(cleanData.otherConvenios || 0) + 
                            Number(cleanData.transportVoucherValue || 0) +
                            Number(cleanData.loans || 0) +
                            Number(cleanData.absences || 0);
    
    const netSalary = totalEarnings - totalDeductions;

    const { data: newLaunch, error } = await supabase
      .from('launches')
      .insert([{
        ...cleanData,
        totalEarnings,
        totalDeductions,
        netSalary
      }])
      .select()
      .single();
    
    if (error) throw error;
    return newLaunch as MonthlyLaunch;
  },

  async updateLaunch(id, data) {
    const { data: current } = await supabase
      .from('launches')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Lançamento não encontrado');

    const cleanData = sanitizeData(data);
    const updated = { ...current, ...cleanData };

    updated.totalEarnings = Number(updated.baseSalary) + Number(updated.functionBonus) + 
                            Number(updated.otherEarnings) + Number(updated.premiumAmount) + 
                            Number(updated.basicBasket) + Number(updated.mealVoucher) + 
                            Number(updated.foodVoucher);

    updated.totalDeductions = Number(updated.advances) + Number(updated.medicalConvenio) + 
                            Number(updated.dentalConvenio) + Number(updated.pharmacyConvenio) + 
                            Number(updated.otherConvenios) + Number(updated.transportVoucherValue) + 
                            Number(updated.loans) + Number(updated.absences);

    updated.netSalary = updated.totalEarnings - updated.totalDeductions;

    const { data: updatedLaunch, error } = await supabase
      .from('launches')
      .update(updated)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedLaunch as MonthlyLaunch;
  },

  async deleteLaunch(id) {
    const { error } = await supabase
      .from('launches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAdvancesByPeriod(period) {
    const { data, error } = await supabase
      .from('advances')
      .select('*')
      .eq('period', period);
    
    if (error) throw error;
    return data as Advance[];
  },

  async saveAdvances(newAdvances) {
    if (newAdvances.length === 0) return;
    const period = newAdvances[0].period;
    await supabase.from('advances').delete().eq('period', period);

    const cleanAdvances = newAdvances.map(a => sanitizeData(a));

    const { error } = await supabase
      .from('advances')
      .insert(cleanAdvances);
    
    if (error) throw error;
  },

  async bulkUpdateVouchers(meal, food) {
    const { error } = await supabase
      .from('employees')
      .update({ 
        defaultMealVoucher: meal, 
        defaultFoodVoucher: food 
      })
      .not('id', 'is', null);
    
    if (error) throw error;
  }
};
