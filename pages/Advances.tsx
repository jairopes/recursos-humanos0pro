
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee, Advance } from '../services/types';
import { Card, Button, Input } from '../components/UI';
import { 
  HandCoins, 
  Download, 
  Save, 
  Search, 
  Calendar,
  AlertCircle,
  Calculator
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Advances: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [search, setSearch] = useState('');
  const [advancesState, setAdvancesState] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, advData] = await Promise.all([
        api.getEmployees(),
        api.getAdvancesByPeriod(period)
      ]);
      setEmployees(empData);
      
      // Map stored variable advances back to state
      const mapped: Record<string, number> = {};
      advData.forEach(a => {
        mapped[a.employeeId] = a.otherAdvances;
      });
      setAdvancesState(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (empId: string, value: number) => {
    setAdvancesState(prev => ({ ...prev, [empId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = employees.map(emp => {
        const standard = (emp.baseSalary + emp.functionBonus) * 0.4;
        const extra = advancesState[emp.id] || 0;
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          period,
          baseSalary: emp.baseSalary,
          functionBonus: emp.functionBonus,
          standardAdvance: standard,
          otherAdvances: extra,
          totalAdvance: standard + extra
        };
      });
      await api.saveAdvances(payload);
      alert("Adiantamentos salvos com sucesso!");
    } catch (err) {
      alert("Erro ao salvar adiantamentos");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      "Funcionário", 
      "Período", 
      "Salário Base", 
      "Acúmulo Função", 
      "Adiantamento (40%)", 
      "Outros Adiant.", 
      "Total Adiantamento"
    ];

    const rows = employees.map(emp => {
      const standard = (emp.baseSalary + emp.functionBonus) * 0.4;
      const extra = advancesState[emp.id] || 0;
      return [
        emp.name,
        period,
        emp.baseSalary,
        emp.functionBonus,
        standard,
        extra,
        standard + extra
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Adiantamentos");
    XLSX.writeFile(workbook, `adiantamentos_${period}.xlsx`);
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HandCoins className="w-8 h-8 text-indigo-500" />
            Adiantamentos
          </h1>
          <p className="text-slate-400">Geração de adiantamentos quinzenais (40% base).</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToExcel} disabled={employees.length === 0}>
            <Download className="w-4 h-4" />
            Exportar XLSX
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} disabled={employees.length === 0}>
            <Save className="w-4 h-4" />
            Salvar Lote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3 py-2 px-4 md:col-span-2">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filtrar funcionário..." 
            className="bg-transparent border-none focus:ring-0 text-slate-200 flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Card>
        <Card className="flex items-center gap-3 py-2 px-4">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <input 
            type="month" 
            className="bg-transparent border-none focus:ring-0 text-slate-200 flex-1"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          />
        </Card>
      </div>

      <Card className="overflow-x-auto p-0 border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold">Funcionário</th>
              <th className="px-6 py-4 font-bold text-right">Salário + Acúmulo</th>
              <th className="px-6 py-4 font-bold text-right">Adiant. (40%)</th>
              <th className="px-6 py-4 font-bold">Outros Adiant.</th>
              <th className="px-6 py-4 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [1,2,3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-800 rounded w-1/3"></div></td>
                </tr>
              ))
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhum funcionário encontrado para o período.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => {
                const totalBase = emp.baseSalary + emp.functionBonus;
                const standard = totalBase * 0.4;
                const extra = advancesState[emp.id] || 0;
                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.role}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      R$ {totalBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-indigo-400">
                      R$ {standard.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 max-w-[150px]">
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:border-indigo-500 outline-none transition-all"
                          value={advancesState[emp.id] || ''}
                          onChange={e => handleVariableChange(emp.id, Number(e.target.value))}
                          placeholder="0,00"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-black text-white font-mono">
                        R$ {(standard + extra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-indigo-400 mt-1 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-200">Sobre os Adiantamentos</h4>
          <p className="text-sm text-slate-400 mt-1">
            O sistema calcula automaticamente 40% sobre a soma do Salário Base e Adicional de Função. 
            Você pode complementar o valor no campo "Outros Adiantamentos" caso existam prêmios ou ajustes manuais para o período.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Advances;
