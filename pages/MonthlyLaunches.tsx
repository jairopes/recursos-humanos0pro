
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee, MonthlyLaunch } from '../services/types';
import { Card, Button, Input, Select, Modal, Badge } from '../components/UI';
import { 
  Calendar, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  UserCircle, 
  Calculator,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

const MonthlyLaunches: React.FC = () => {
  const [launches, setLaunches] = useState<MonthlyLaunch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm = {
    employeeId: '',
    employeeName: '',
    closingDate: new Date().toISOString().split('T')[0],
    baseSalary: 0,
    functionBonus: 0,
    otherEarnings: 0,
    premiumAmount: 0,
    basicBasket: 0,
    extraHours100: 0,
    extraHours70: 0,
    extraHours50: 0,
    hasTransportVoucher: false,
    transportVoucherValue: 0,
    advances: 0,
    mealVoucher: 0,
    foodVoucher: 0,
    medicalConvenio: 0,
    dentalConvenio: 0,
    pharmacyConvenio: 0,
    otherConvenios: 0,
    absences: 0,
    loans: 0,
    otherDiscounts: '',
    notes: ''
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [launData, empData] = await Promise.all([
        api.getLaunches(),
        api.getEmployees()
      ]);
      setLaunches(launData);
      setEmployees(empData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value;
    const emp = employees.find(x => x.id === empId);
    if (emp) {
      setForm({
        ...form,
        employeeId: empId,
        employeeName: emp.name,
        baseSalary: emp.baseSalary,
        functionBonus: emp.functionBonus
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("Selecione um funcionário");
    
    setIsSaving(true);
    try {
      await api.createLaunch(form);
      setIsModalOpen(false);
      setForm(initialForm);
      loadData();
    } catch (err) {
      alert("Erro ao lançar folha");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este lançamento?")) {
      await api.deleteLaunch(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Lançamentos Mensais</h1>
          <p className="text-slate-400">Processamento de folha e descontos periódicos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Calculator className="w-4 h-4" />
          Lançar Folha Mensal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-20 bg-slate-900 animate-pulse rounded-2xl" />)
        ) : launches.length === 0 ? (
          <Card className="py-20 text-center bg-slate-900/20 border-dashed border-slate-800">
            <Calendar className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum lançamento registrado neste mês.</p>
          </Card>
        ) : (
          launches.map(l => (
            <Card key={l.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 border-l-4 border-l-indigo-600 hover:bg-slate-900/50 transition-colors">
               <div className="flex items-center gap-4 min-w-[200px]">
                 <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                   <UserCircle className="w-6 h-6" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-100">{l.employeeName}</h4>
                   <span className="text-xs text-slate-500 font-mono uppercase">{new Date(l.closingDate).toLocaleDateString()}</span>
                 </div>
               </div>

               <div className="flex flex-1 flex-wrap gap-8 justify-center">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Rendimentos</span>
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ArrowUpRight className="w-3 h-3" />
                      R$ {l.totalEarnings.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Descontos</span>
                    <div className="flex items-center gap-1 text-red-400 font-bold">
                      <ArrowDownRight className="w-3 h-3" />
                      R$ {l.totalDeductions.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Líquido</span>
                    <div className="text-indigo-400 font-black text-lg">
                      R$ {l.netSalary.toLocaleString('pt-BR')}
                    </div>
                  </div>
               </div>

               <button onClick={() => handleDelete(l.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                 <Trash2 className="w-5 h-5" />
               </button>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento Mensal">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="FUNCIONÁRIO" 
              value={form.employeeId} 
              onChange={handleEmployeeChange}
              options={employees.map(e => ({ value: e.id, label: e.name }))}
              placeholder="Selecione o funcionário"
              required
            />
            <Input label="DATA FECHAMENTO" type="date" value={form.closingDate} onChange={e => setForm({...form, closingDate: e.target.value})} required />
          </div>

          {/* RENDIMENTOS */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-200">Rendimentos</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="OUTROS RENDIMENTOS (RS)" type="number" step="0.01" value={form.otherEarnings} onChange={e => setForm({...form, otherEarnings: Number(e.target.value)})} />
                <Input label="PRÊMIOS (RS)" type="number" step="0.01" value={form.premiumAmount} onChange={e => setForm({...form, premiumAmount: Number(e.target.value)})} />
                <Input label="CESTA BÁSICA (RS)" type="number" step="0.01" value={form.basicBasket} onChange={e => setForm({...form, basicBasket: Number(e.target.value)})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="VALE REFEIÇÃO (RS)" type="number" step="0.01" value={form.mealVoucher} onChange={e => setForm({...form, mealVoucher: Number(e.target.value)})} />
                <Input label="VALE ALIMENTAÇÃO (RS)" type="number" step="0.01" value={form.foodVoucher} onChange={e => setForm({...form, foodVoucher: Number(e.target.value)})} />
                <div className="hidden md:block" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="H.E. 100%" type="number" value={form.extraHours100} onChange={e => setForm({...form, extraHours100: Number(e.target.value)})} />
                <Input label="H.E. 70%" type="number" value={form.extraHours70} onChange={e => setForm({...form, extraHours70: Number(e.target.value)})} />
                <Input label="H.E. 50%" type="number" value={form.extraHours50} onChange={e => setForm({...form, extraHours50: Number(e.target.value)})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vale Transporte?</span>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    checked={form.hasTransportVoucher}
                    onChange={e => setForm({...form, hasTransportVoucher: e.target.checked})}
                  />
                </div>
                {form.hasTransportVoucher ? (
                  <Input label="VALOR VALE TRANSPORTE (RS)" type="number" step="0.01" value={form.transportVoucherValue} onChange={e => setForm({...form, transportVoucherValue: Number(e.target.value)})} />
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            </div>
          </div>

          {/* DESCONTOS & CONVÊNIOS */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-200">Descontos & Convênios</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="ADIANTAMENTOS" type="number" step="0.01" value={form.advances} onChange={e => setForm({...form, advances: Number(e.target.value)})} />
                <Input label="FALTAS (QUANTIDADE)" type="number" value={form.absences} onChange={e => setForm({...form, absences: Number(e.target.value)})} />
                <Input label="EMPRÉSTIMOS (RS)" type="number" step="0.01" value={form.loans} onChange={e => setForm({...form, loans: Number(e.target.value)})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <Input label="OUTROS DESCONTOS" value={form.otherDiscounts} onChange={e => setForm({...form, otherDiscounts: e.target.value})} placeholder="Ex: Multa" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="C. MÉDICO (RS)" type="number" step="0.01" value={form.medicalConvenio} onChange={e => setForm({...form, medicalConvenio: Number(e.target.value)})} />
                <Input label="C. DENTÁRIO (RS)" type="number" step="0.01" value={form.dentalConvenio} onChange={e => setForm({...form, dentalConvenio: Number(e.target.value)})} />
                <Input label="OUTROS CONVÊNIOS (RS)" type="number" step="0.01" value={form.otherConvenios} onChange={e => setForm({...form, otherConvenios: Number(e.target.value)})} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-400 px-1">OBSERVAÇÕES</label>
                <textarea 
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Informações adicionais sobre o lançamento..."
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-6">Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="px-8">
              <Calculator className="w-4 h-4" />
              Finalizar Lançamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MonthlyLaunches;
