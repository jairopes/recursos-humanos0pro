
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee, SalaryEvolution as ISalaryEvolution } from '../services/types';
import { Card, Button, Input, Modal, Select, Badge } from '../components/UI';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  History,
  Download,
  ArrowRight,
  FileText,
  AlertCircle,
  Database,
  Copy,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';

const SalaryEvolution: React.FC = () => {
  const [evolutions, setEvolutions] = useState<ISalaryEvolution[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [missingTable, setMissingTable] = useState(false);

  const initialForm = {
    employeeId: '',
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    baseSalary: 0,
    functionBonus: 0,
    otherEarnings: 0,
    reason: '',
    role: ''
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setMissingTable(false);
    try {
      const empData = await api.getEmployees();
      setEmployees(empData || []);
      
      const evData = await api.getSalaryEvolutions();
      setEvolutions(evData || []);
    } catch (err: any) {
      console.error("Erro capturado no SalaryEvolution:", err);
      // Identifica qualquer sinal de que a tabela não existe
      if (err.code === 'TABLE_MISSING' || err.code === '42P01' || err.message.includes('não encontrada') || err.message.includes('cache')) {
        setMissingTable(true);
      } else {
        alert("Erro ao carregar dados: " + err.message);
      }
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
        baseSalary: Number(emp.baseSalary) || 0,
        functionBonus: Number(emp.functionBonus) || 0,
        role: emp.role || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.employeeId) return alert("Selecione um funcionário.");
    if (!form.role.trim()) return alert("O cargo é obrigatório.");
    if (!form.reason.trim()) return alert("O motivo é obrigatório.");

    setIsSaving(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        employeeName: form.employeeName,
        date: form.date,
        baseSalary: Number(form.baseSalary),
        functionBonus: Number(form.functionBonus),
        otherEarnings: Number(form.otherEarnings),
        reason: form.reason,
        role: form.role
      };

      await api.createSalaryEvolution(payload);
      
      alert("Sucesso! Evolução salarial registrada.");
      setIsModalOpen(false);
      setForm(initialForm);
      await loadData();
    } catch (err: any) {
      console.error("Erro ao registrar evolução:", err);
      if (err.code === 'TABLE_MISSING' || err.message.includes('tabela')) {
        setMissingTable(true);
        alert("A tabela de evolução não existe no seu banco de dados. Siga as instruções de configuração na tela.");
      } else {
        alert(err.message || "Erro desconhecido ao salvar.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este histórico?")) {
      try {
        await api.deleteSalaryEvolution(id);
        await loadData();
      } catch (err: any) {
        alert("Erro ao excluir: " + err.message);
      }
    }
  };

  const exportToExcel = () => {
    if (evolutions.length === 0) return alert("Não há histórico para exportar.");

    const headers = ["Colaborador", "Data Alteração", "Cargo", "Motivo", "Salário Base", "Acúmulo Função", "Outros", "Total Bruto"];
    const rows = evolutions.map(ev => [
      ev.employeeName,
      new Date(ev.date).toLocaleDateString('pt-BR'),
      ev.role,
      ev.reason,
      ev.baseSalary,
      ev.functionBonus,
      ev.otherEarnings,
      Number(ev.baseSalary) + Number(ev.functionBonus) + Number(ev.otherEarnings)
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evolução Salarial");
    XLSX.writeFile(workbook, `evolucao_salarial_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const copySQL = () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.salary_evolution (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" uuid NULL,
    "employeeName" text NULL,
    "date" date NULL,
    "baseSalary" numeric NULL,
    "functionBonus" numeric NULL,
    "otherEarnings" numeric NULL,
    "reason" text NULL,
    "role" text NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT salary_evolution_pkey PRIMARY KEY (id),
    CONSTRAINT salary_evolution_employeeId_fkey 
      FOREIGN KEY ("employeeId") REFERENCES employees(id) 
      ON DELETE CASCADE
);
ALTER TABLE public.salary_evolution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total Evolucao" ON public.salary_evolution FOR ALL USING (true);`;
    navigator.clipboard.writeText(sql);
    alert("Código SQL copiado! Cole-o no SQL Editor do seu Supabase.");
  };

  const filteredEvolutions = evolutions.filter(ev => 
    ev.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            Evolução Salarial
          </h1>
          <p className="text-slate-400">Histórico de progressão e ajustes salariais.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {!missingTable && (
            <Button variant="secondary" onClick={exportToExcel} disabled={evolutions.length === 0} className="flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          )}
          <Button onClick={() => { setForm(initialForm); setIsModalOpen(true); }} className="flex-1 sm:flex-none" disabled={missingTable}>
            <Plus className="w-5 h-5" />
            Nova Evolução
          </Button>
        </div>
      </div>

      {missingTable ? (
        <Card className="border-indigo-500/50 bg-indigo-500/5 p-8 shadow-2xl shadow-indigo-500/10">
          <div className="flex items-start gap-6">
            <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-600/10">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">Configuração Necessária no Banco</h3>
              <p className="text-slate-400 mt-2 text-lg">
                O recurso de histórico de evolução exige uma tabela adicional no seu Supabase.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-4 text-slate-300 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">1</div>
                    <span>Acesse seu painel no <strong>Supabase</strong>.</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">2</div>
                    <span>Vá em <strong>SQL Editor</strong> e crie uma <strong>New Query</strong>.</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">3</div>
                    <span>Cole o código SQL e clique em <strong>Run</strong>.</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 relative group ring-1 ring-slate-800">
                  <button 
                    onClick={copySQL}
                    className="absolute right-4 top-4 p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl text-white transition-all shadow-lg active:scale-95"
                    title="Copiar Código"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="text-[10px] text-indigo-400/90 font-mono overflow-x-auto leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.salary_evolution (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" uuid NULL,
    "employeeName" text NULL,
    "date" date NULL,
    "baseSalary" numeric NULL,
    "functionBonus" numeric NULL,
    "otherEarnings" numeric NULL,
    "reason" text NULL,
    "role" text NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT salary_evolution_pkey PRIMARY KEY (id),
    CONSTRAINT salary_evolution_employeeId_fkey 
      FOREIGN KEY ("employeeId") REFERENCES employees(id) 
      ON DELETE CASCADE
);
ALTER TABLE public.salary_evolution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Total" ON public.salary_evolution FOR ALL USING (true);`}
                  </pre>
                </div>
              </div>
              
              <div className="mt-10 flex justify-end">
                <Button onClick={loadData} variant="primary" className="gap-2 px-8 py-4">
                  <CheckCircle2 className="w-5 h-5" />
                  Atualizar após executar SQL
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex items-center gap-3 bg-slate-900/40 p-1 border-slate-800/50">
            <div className="flex items-center w-full bg-slate-800/50 rounded-xl px-3 py-1">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Filtrar por nome do colaborador..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 py-3 ml-2 placeholder:text-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </Card>

          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-24 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />)
            ) : filteredEvolutions.length === 0 ? (
              <Card className="py-20 text-center bg-slate-900/20 border-dashed border-slate-800">
                <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum histórico registrado no banco de dados.</p>
              </Card>
            ) : (
              filteredEvolutions.map(ev => (
                <Card key={ev.id} className="group hover:bg-slate-900/60 border-l-4 border-l-indigo-600 transition-all py-4">
                  <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-lg truncate">{ev.employeeName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="info">{new Date(ev.date).toLocaleDateString('pt-BR')}</Badge>
                          <span className="text-slate-400 text-xs flex items-center gap-1 font-medium bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 truncate max-w-[200px]">
                            <Briefcase className="w-3 h-3" /> {ev.role}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1 font-mono uppercase tracking-widest ml-2 truncate">
                            <ArrowRight className="w-3 h-3" /> {ev.reason}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 items-center lg:justify-end w-full lg:w-auto bg-slate-800/20 lg:bg-transparent p-4 lg:p-0 rounded-2xl">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Total Bruto</span>
                        <div className="text-indigo-400 font-black text-lg">
                          R$ {(Number(ev.baseSalary) + Number(ev.functionBonus) + Number(ev.otherEarnings)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(ev.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Evolução Salarial">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="COLABORADOR" 
              value={form.employeeId} 
              onChange={handleEmployeeChange}
              options={employees.map(e => ({ value: e.id, label: e.name }))}
              placeholder="Selecione o funcionário"
              required
            />
            <Input label="DATA DA ALTERAÇÃO" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-6 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Nova Remuneração</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="NOVO SALÁRIO BASE (RS)" type="number" step="0.01" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: Number(e.target.value)})} required />
              <Input label="ACÚMULO DE FUNÇÃO (RS)" type="number" step="0.01" value={form.functionBonus} onChange={e => setForm({...form, functionBonus: Number(e.target.value)})} />
              <Input label="OUTROS RENDIMENTOS (RS)" type="number" step="0.01" value={form.otherEarnings} onChange={e => setForm({...form, otherEarnings: Number(e.target.value)})} />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Novo Cargo e Motivo</h3>
            </div>
            
            <div className="space-y-4">
              <Input label="NOVA FUNÇÃO / CARGO" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Ex: Supervisor de Produção" required />
              <Input label="MOTIVO DA ALTERAÇÃO" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Ex: Promoção / Mérito / Dissídio" required />
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl flex gap-3 items-center border border-slate-700">
            <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
            <p className="text-xs text-slate-400">Esta alteração será registrada apenas no histórico. O cadastro original do funcionário deve ser atualizado manualmente na aba "Funcionários".</p>
          </div>

          <div className="pt-8 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-6">Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="px-8 shadow-indigo-600/20">
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Evolução
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryEvolution;
