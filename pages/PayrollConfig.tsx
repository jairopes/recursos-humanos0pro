
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Employee } from '../services/types';
import { Card, Badge, Button } from '../components/UI';
import { DollarSign, UserCheck, AlertCircle } from 'lucide-react';

const PayrollConfig: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Folha de Pagamento</h1>
        <p className="text-slate-400">Configuração de vencimentos e encargos por colaborador.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />)}
          </div>
        ) : employees.length === 0 ? (
          <Card className="py-20 text-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">Cadastre funcionários para visualizar a folha.</p>
          </Card>
        ) : (
          employees.map(emp => (
            <Card key={emp.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{emp.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserCheck className="w-3 h-3" />
                    Admitido em {new Date(emp.hireDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="min-w-[120px]">
                  <span className="text-xs text-slate-500 block uppercase mb-1">Salário Base</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-100">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    R$ {emp.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="min-w-[120px]">
                  <span className="text-xs text-slate-500 block uppercase mb-1">Acúmulo Função</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-100">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    R$ {emp.functionBonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="min-w-[120px]">
                  <span className="text-xs text-slate-500 block uppercase mb-1">Total Bruto</span>
                  <div className="text-lg font-black text-white">
                    R$ {(emp.baseSalary + emp.functionBonus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="success">Configurado</Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PayrollConfig;
