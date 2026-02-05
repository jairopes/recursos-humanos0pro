
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Employee } from '../services/types';
import { Card, Button, Input, Modal, Badge, Select } from '../components/UI';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Users, 
  User, 
  DollarSign, 
  Save,
  Coffee,
  AlertTriangle,
  FileText,
  Heart,
  StickyNote
} from 'lucide-react';

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  return true;
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cpfError, setCpfError] = useState(false);

  const initialForm = {
    name: '', 
    email: '',
    role: '',
    hireDate: '', 
    exitDate: '',
    birthDate: '',
    company: '', 
    address: '', 
    phone: '',
    city: '', 
    state: '', 
    cep: '',
    fatherName: '', 
    motherName: '', 
    cpf: '', 
    rg: '', 
    ctps: '', 
    pis: '',
    voterId: '', 
    baseSalary: 0, 
    functionBonus: 0,
    defaultMealVoucher: 0,
    defaultFoodVoucher: 0,
    notes: ''
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Falha ao carregar funcionários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCPF(form.cpf)) {
      setCpfError(true);
      alert("O CPF informado é inválido. Por favor, verifique.");
      return;
    }
    
    setCpfError(false);
    setIsSaving(true);

    try {
      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, form);
      } else {
        await api.createEmployee(form);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setForm(initialForm);
      await loadEmployees();
    } catch (err: any) {
      console.error('Erro detalhado no handleSubmit:', err);
      alert(`Erro ao salvar funcionário: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setCpfError(false);
    setForm({
      name: emp.name, 
      email: emp.email || '',
      role: emp.role || '',
      hireDate: emp.hireDate || '', 
      exitDate: emp.exitDate || '',
      birthDate: emp.birthDate || '',
      company: emp.company || '', 
      address: emp.address || '',
      phone: emp.phone || '',
      city: emp.city || '', 
      state: emp.state || '', 
      cep: emp.cep || '',
      fatherName: emp.fatherName || '', 
      motherName: emp.motherName || '',
      cpf: emp.cpf || '', 
      rg: emp.rg || '', 
      ctps: emp.ctps || '', 
      pis: emp.pis || '', 
      voterId: emp.voterId || '',
      baseSalary: emp.baseSalary || 0, 
      functionBonus: emp.functionBonus || 0,
      defaultMealVoucher: emp.defaultMealVoucher || 0,
      defaultFoodVoucher: emp.defaultFoodVoucher || 0,
      notes: emp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await api.deleteEmployee(id);
        loadEmployees();
      } catch (err) {
        alert("Erro ao excluir funcionário.");
      }
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || e.cpf.includes(search)
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <div className="p-1.5 bg-slate-800 rounded-lg">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recursos Humanos</h1>
          <p className="text-slate-400">Cadastro e Gestão de Funcionários</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setForm(initialForm); setCpfError(false); setIsModalOpen(true); }} className="px-6">
          <Plus className="w-5 h-5" />
          Novo Funcionário
        </Button>
      </div>

      <Card className="flex items-center gap-3 bg-slate-900/40 p-1 border-slate-800/50">
        <div className="flex items-center w-full bg-slate-800/50 rounded-xl px-3 py-1">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 py-3 ml-2 placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />)
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
            <Users className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum funcionário encontrado.</p>
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <Card key={emp.id} className="group hover:border-indigo-500/50 transition-all border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/20">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">{emp.name}</h3>
              <p className="text-xs text-slate-500 mb-2 font-mono">{formatCPF(emp.cpf)}</p>
              <p className="text-[10px] text-slate-600 mb-4 font-mono truncate">{emp.email || 'Sem e-mail'}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{emp.role || 'Cargo não definido'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="truncate">R$ {(Number(emp.baseSalary) + Number(emp.functionBonus)).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">
                  VR: R$ {emp.defaultMealVoucher} | VA: R$ {emp.defaultFoodVoucher}
                </div>
                <Badge variant={emp.exitDate ? 'warning' : 'success'}>
                  {emp.exitDate ? 'Desligado' : 'Ativo'}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? "Editar Funcionário" : "Cadastro de Funcionários"}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          
          <div>
            <SectionHeader icon={Briefcase} title="Dados do Contrato" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="EMPRESA CONTRATANTE" 
                value={form.company} 
                onChange={e => setForm({...form, company: e.target.value})} 
                options={[
                  { value: 'CAMPLUVAS', label: 'CAMPLUVAS' },
                  { value: 'LOCATEX', label: 'LOCATEX' }
                ]}
                placeholder="Selecione..."
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input label="DATA ADMISSÃO" type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} required />
                <Input label="DATA SAÍDA" type="date" value={form.exitDate} onChange={e => setForm({...form, exitDate: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Input label="FUNÇÃO / CARGO" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Ex: Analista Financeiro" required />
              </div>
            </div>
          </div>

          <div>
            <SectionHeader icon={User} title="Identificação & Acesso" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="NOME COMPLETO" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Digite o nome completo" required />
              </div>
              <Input label="E-MAIL CORPORATIVO (PARA LOGIN)" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="exemplo@empresa.com" required />
              <Input label="DATA DE NASCIMENTO" type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} required />
              
              <div className="relative">
                <Input 
                  label="NÚMERO CPF" 
                  value={formatCPF(form.cpf)} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').substring(0, 11);
                    setForm({...form, cpf: val});
                    if (val.length === 11) {
                      setCpfError(!validateCPF(val));
                    } else {
                      setCpfError(false);
                    }
                  }} 
                  placeholder="000.000.000-00" 
                  required 
                  className={cpfError ? 'border-red-500 text-red-400' : ''}
                />
                {cpfError && (
                  <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-bold uppercase tracking-tight animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> CPF Inválido
                  </span>
                )}
              </div>
              <Input label="REGISTRO GERAL (RG)" value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} placeholder="00.000.000-0" required />
            </div>
          </div>

          <div>
            <SectionHeader icon={FileText} title="Documentação Profissional" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="CARTEIRA TRABALHO (CTPS)" value={form.ctps} onChange={e => setForm({...form, ctps: e.target.value})} placeholder="Número e Série" />
              <Input label="PIS" value={form.pis} onChange={e => setForm({...form, pis: e.target.value})} placeholder="000.00000.00.0" />
              <Input label="TÍTULO DE ELEITOR" value={form.voterId} onChange={e => setForm({...form, voterId: e.target.value})} placeholder="0000 0000 0000" />
            </div>
          </div>

          <div>
            <SectionHeader icon={Heart} title="Filiação" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="NOME DO PAI" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} placeholder="Nome completo do pai" />
              <Input label="NOME DA MÃE" value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} placeholder="Nome completo da mãe" />
            </div>
          </div>

          <div>
            <SectionHeader icon={DollarSign} title="Remuneração Mensal" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="SALÁRIO BASE (RS)" type="number" step="0.01" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: Number(e.target.value)})} required />
              <Input label="ACÚMULO DE FUNÇÃO (RS)" type="number" step="0.01" value={form.functionBonus} onChange={e => setForm({...form, functionBonus: Number(e.target.value)})} />
            </div>
          </div>

          <div>
            <SectionHeader icon={Coffee} title="Benefícios Padrão" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="VALE REFEIÇÃO PADRÃO (RS)" type="number" step="0.01" value={form.defaultMealVoucher} onChange={e => setForm({...form, defaultMealVoucher: Number(e.target.value)})} />
              <Input label="VALE ALIMENTAÇÃO PADRÃO (RS)" type="number" step="0.01" value={form.defaultFoodVoucher} onChange={e => setForm({...form, defaultFoodVoucher: Number(e.target.value)})} />
            </div>
          </div>

          <div>
            <SectionHeader icon={MapPin} title="Endereço e Contato" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input label="ENDEREÇO" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
              </div>
              <Input label="CIDADE" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
              <Input label="UF" value={form.state} onChange={e => setForm({...form, state: e.target.value})} required />
              <Input label="CEP" value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} />
              <Input label="TELEFONE" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div>
            <SectionHeader icon={StickyNote} title="Observações Gerais" />
            <div className="flex flex-col gap-1.5">
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[120px] placeholder:text-slate-600"
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Insira aqui informações adicionais relevantes sobre o histórico do colaborador..."
              />
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex justify-end">
            <Button 
              type="submit" 
              isLoading={isSaving} 
              className="px-10 py-4 shadow-xl shadow-indigo-600/20" 
              disabled={cpfError || form.cpf.length < 11 || isSaving}
            >
              <Save className="w-5 h-5" />
              {editingEmployee ? "Salvar Alterações" : "Finalizar Cadastro"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
