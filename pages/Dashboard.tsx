
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Employee, MonthlyLaunch } from '../services/types';
import { Card, Badge, Button, Modal, Input, Select } from '../components/UI';
import { Users, DollarSign, Receipt, TrendingUp, Download, FileText, Zap, RefreshCw, Calculator } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [launches, setLaunches] = useState<MonthlyLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Modais
  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados dos formulários rápidos
  const [quickLaunchForm, setQuickLaunchForm] = useState({
    employeeId: '',
    otherEarnings: 0,
    absences: 0,
    premiumAmount: 0
  });

  const [bulkVoucherForm, setBulkVoucherForm] = useState({
    meal: 0,
    food: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empData, launchData] = await Promise.all([
        api.getEmployees(),
        api.getLaunches()
      ]);
      setEmployees(empData);
      setLaunches(launchData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLaunchForm.employeeId) return alert("Selecione um funcionário");
    
    setIsProcessing(true);
    try {
      const emp = employees.find(x => x.id === quickLaunchForm.employeeId)!;
      await api.createLaunch({
        employeeId: emp.id,
        employeeName: emp.name,
        closingDate: new Date().toISOString().split('T')[0],
        baseSalary: emp.baseSalary,
        functionBonus: emp.functionBonus,
        otherEarnings: quickLaunchForm.otherEarnings,
        premiumAmount: quickLaunchForm.premiumAmount,
        basicBasket: 0,
        extraHours100: 0,
        extraHours70: 0,
        extraHours50: 0,
        hasTransportVoucher: false,
        transportVoucherValue: 0,
        advances: 0,
        mealVoucher: emp.defaultMealVoucher || 0,
        foodVoucher: emp.defaultFoodVoucher || 0,
        medicalConvenio: 0,
        dentalConvenio: 0,
        pharmacyConvenio: 0,
        otherConvenios: 0,
        absences: quickLaunchForm.absences,
        loans: 0,
        otherDiscounts: '',
        notes: 'Lançamento via Ação Rápida'
      });
      setIsQuickLaunchOpen(false);
      setQuickLaunchForm({ employeeId: '', otherEarnings: 0, absences: 0, premiumAmount: 0 });
      fetchData();
    } catch (err) {
      alert("Erro no lançamento rápido");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkVoucherUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.bulkUpdateVouchers(bulkVoucherForm.meal, bulkVoucherForm.food);
      setIsBulkUpdateOpen(false);
      alert("Vales atualizados para todos os funcionários!");
      fetchData();
    } catch (err) {
      alert("Erro na atualização em lote");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportAnnualReport = () => {
    if (launches.length === 0) return alert("Sem dados para o relatório");
    
    const year = new Date().getFullYear();
    const headers = ["Funcionário", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro", "Total Anual"];
    
    // Agrupa lançamentos por funcionário
    const empMap: Record<string, number[]> = {};
    launches.forEach(l => {
      const date = new Date(l.closingDate);
      if (date.getFullYear() === year) {
        if (!empMap[l.employeeName]) empMap[l.employeeName] = new Array(12).fill(0);
        empMap[l.employeeName][date.getMonth()] += l.netSalary;
      }
    });

    const rows = Object.entries(empMap).map(([name, months]) => {
      const total = months.reduce((a, b) => a + b, 0);
      return [name, ...months, total];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Relatorio_${year}`);
    XLSX.writeFile(workbook, `Relatorio_Anual_RH_${year}.xlsx`);
  };

  const totalPayroll = launches.reduce((acc, curr) => acc + curr.netSalary, 0);
  const avgSalary = employees.length > 0 ? employees.reduce((acc, curr) => acc + curr.baseSalary, 0) / employees.length : 0;
  
  const chartData = launches.slice(0, 6).reverse().map(l => ({
    name: l.employeeName.split(' ')[0],
    val: l.netSalary
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
        ))}
      </div>
    );
  }

  const kpis = [
    { label: 'Funcionários', value: employees.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Folha (Líquido)', value: `R$ ${totalPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Salário Médio', value: `R$ ${avgSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Lançamentos', value: launches.length, icon: Receipt, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-slate-400">Bem-vindo ao centro de controle de Recursos Humanos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="flex flex-col gap-4 group transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <Badge variant="info">Recente</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{kpi.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Últimos Pagamentos Líquidos</h3>
            <Button variant="secondary" onClick={() => XLSX.writeFile(XLSX.utils.book_new(), "dummy.xlsx")} className="text-xs">
              <Download className="w-4 h-4" />
              Exportar XLSX
            </Button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-6">Ações Rápidas</h3>
          <div className="space-y-3">
             <div onClick={() => setIsQuickLaunchOpen(true)} className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 font-medium group-hover:text-white">Lançar folha rápida</span>
                <Zap className="w-4 h-4 text-indigo-400" />
             </div>
             <div onClick={exportAnnualReport} className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 font-medium group-hover:text-white">Relatório Anual</span>
                <FileText className="w-4 h-4 text-emerald-400" />
             </div>
             <div onClick={() => setIsBulkUpdateOpen(true)} className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 font-medium group-hover:text-white">Atualizar Vales</span>
                <RefreshCw className="w-4 h-4 text-amber-400" />
             </div>
          </div>
        </Card>
      </div>

      {/* Modal: Lançamento Rápido */}
      <Modal isOpen={isQuickLaunchOpen} onClose={() => setIsQuickLaunchOpen(false)} title="Lançamento Rápido">
        <form onSubmit={handleQuickLaunch} className="space-y-4">
          <Select 
            label="Funcionário"
            value={quickLaunchForm.employeeId}
            onChange={e => setQuickLaunchForm({...quickLaunchForm, employeeId: e.target.value})}
            options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prêmios (R$)" type="number" step="0.01" value={quickLaunchForm.premiumAmount} onChange={e => setQuickLaunchForm({...quickLaunchForm, premiumAmount: Number(e.target.value)})} />
            <Input label="Rendimentos Extras (R$)" type="number" step="0.01" value={quickLaunchForm.otherEarnings} onChange={e => setQuickLaunchForm({...quickLaunchForm, otherEarnings: Number(e.target.value)})} />
          </div>
          <Input label="Faltas (Qtd Dias)" type="number" value={quickLaunchForm.absences} onChange={e => setQuickLaunchForm({...quickLaunchForm, absences: Number(e.target.value)})} />
          
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setIsQuickLaunchOpen(false)}>Cancelar</Button>
             <Button type="submit" isLoading={isProcessing}>Confirmar Lançamento</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Atualização em Lote */}
      <Modal isOpen={isBulkUpdateOpen} onClose={() => setIsBulkUpdateOpen(false)} title="Atualizar Benefícios em Lote">
        <form onSubmit={handleBulkVoucherUpdate} className="space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
            <Calculator className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">Esta ação atualizará o valor padrão de VR/VA de TODOS os {employees.length} funcionários cadastrados.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Novo Vale Refeição (R$)" type="number" step="0.01" value={bulkVoucherForm.meal} onChange={e => setBulkVoucherForm({...bulkVoucherForm, meal: Number(e.target.value)})} />
            <Input label="Novo Vale Alimentação (R$)" type="number" step="0.01" value={bulkVoucherForm.food} onChange={e => setBulkVoucherForm({...bulkVoucherForm, food: Number(e.target.value)})} />
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setIsBulkUpdateOpen(false)}>Cancelar</Button>
             <Button type="submit" isLoading={isProcessing}>Atualizar Todos</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
