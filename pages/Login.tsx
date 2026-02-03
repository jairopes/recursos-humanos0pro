
import React, { useState } from 'react';
import { api } from '../services/api';
import { Button, Card } from '../components/UI';
import { Users, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (userName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    // Bypass de emergência para configuração inicial
    if (cleanEmail === 'admin@admin.com') {
      setTimeout(() => {
        onLogin('Administrador Mestre');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const user = await api.validateLogin(cleanEmail);
      
      if (user) {
        onLogin(user.name);
      } else {
        setError('E-mail não autorizado ou não encontrado no sistema. Use admin@admin.com para o primeiro acesso.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro de comunicação. Verifique se a coluna "email" existe na sua tabela "employees" no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recursos Humanos</h1>
          <p className="text-slate-400 mt-2 font-medium">Gestão Pro & Controle de Folha</p>
        </div>

        <Card className="p-8 border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-20 h-20 text-indigo-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-200 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required
                  placeholder="colaborador@empresa.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-bold mt-4" 
              isLoading={loading}
            >
              Entrar no Sistema
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">
              Ambiente Seguro e Monitorado. <br/>
              Acesso por e-mail cadastrado no RH.
            </p>
          </div>
        </Card>
        
        <p className="text-center mt-8 text-slate-600 text-xs">
          &copy; 2024 Recursos Humanos Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
