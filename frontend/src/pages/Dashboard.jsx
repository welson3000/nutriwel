import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { authClient, sql } from '../lib/neon';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [consultasSemana, setConsultasSemana] = useState(0);
  const [pacientesSemRetorno, setPacientesSemRetorno] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const nutricionistaId = session.user.id;

      // 1. Total de pacientes ativos
      const pacientesResult = await sql`
        SELECT COUNT(*)::int AS total 
        FROM public.pacientes 
        WHERE nutricionista_id = ${nutricionistaId}
      `;
      setTotalPacientes(pacientesResult[0]?.total || 0);

      // 2. Consultas da semana atual (Segunda a Domingo)
      const now = new Date();
      const currentDay = now.getDay();
      // Seg: 1, Ter: 2, ..., Dom: 0 -> Ajustar para segunda-feira como inicio
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const mondayStr = monday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      const consultasResult = await sql`
        SELECT COUNT(*)::int AS total
        FROM public.consultas c
        JOIN public.pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
          AND c.data_consulta >= ${mondayStr}
          AND c.data_consulta <= ${sundayStr}
      `;
      setConsultasSemana(consultasResult[0]?.total || 0);

      // 3. Pacientes sem retorno (> 30 dias desde a última consulta e sem retorno futuro agendado)
      const semRetornoResult = await sql`
        SELECT 
          p.id, 
          p.nome, 
          MAX(c.data_consulta)::text AS ultima_consulta,
          MAX(c.proximo_retorno)::text AS proximo_retorno
        FROM public.pacientes p
        JOIN public.consultas c ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
        GROUP BY p.id, p.nome
        HAVING MAX(c.data_consulta) < CURRENT_DATE - INTERVAL '30 days'
           AND (MAX(c.proximo_retorno) IS NULL OR MAX(c.proximo_retorno) < CURRENT_DATE)
        ORDER BY MAX(c.data_consulta) ASC
      `;
      setPacientesSemRetorno(semRetornoResult || []);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Falha ao carregar os dados em tempo real.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const formatDaysAgo = (dateStr) => {
    if (!dateStr) return '';
    const lastDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Há ${diffDays} dias`;
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Bem-vindo(a), <strong>{session?.user?.name || 'Nutricionista'}</strong>! Confira o resumo do seu consultório.
          </p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="btn-secondary flex-center gap-2" 
          disabled={isLoading}
          title="Atualizar dados"
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          <span>Atualizar</span>
        </button>
      </header>

      {error && (
        <div className="error-banner flex-center-start gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid com os 3 cards principais */}
      <div className="stats-cards-grid">
        {/* Card 1: Total de pacientes ativos */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Pacientes Ativos</span>
            <div className="stat-icon-wrapper icon-emerald">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? <span className="skeleton-loader"></span> : totalPacientes}
          </div>
          <p className="stat-desc">Total de pacientes cadastrados por você</p>
        </div>

        {/* Card 2: Consultas da semana */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Consultas da Semana</span>
            <div className="stat-icon-wrapper icon-teal">
              <Calendar size={22} />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? <span className="skeleton-loader"></span> : consultasSemana}
          </div>
          <p className="stat-desc">Consultas registradas na semana atual</p>
        </div>

        {/* Card 3 Summary Counter */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Sem Retorno ({'>'} 30 dias)</span>
            <div className="stat-icon-wrapper icon-amber">
              <AlertCircle size={22} />
            </div>
          </div>
          <div className="stat-value">
            {isLoading ? <span className="skeleton-loader"></span> : pacientesSemRetorno.length}
          </div>
          <p className="stat-desc">Pacientes aguardando reagendamento</p>
        </div>
      </div>

      {/* Card 3 Detalhado — Pacientes sem retorno */}
      <div className="dashboard-section margin-top-6">
        <div className="content-card shadow-sm">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title flex-center-start gap-2">
                <AlertCircle className="text-amber" size={20} />
                <span>Pacientes Sem Retorno</span>
              </h2>
              <p className="card-subtitle">
                Pacientes cuja última consulta foi há mais de 30 dias e não possuem próximo retorno agendado.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ) : pacientesSemRetorno.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text font-medium">Nenhum paciente sem retorno no momento</p>
              <p className="empty-subtext">Todos os seus pacientes estão com retornos em dia ou em menos de 30 dias.</p>
            </div>
          ) : (
            <div className="overdue-list">
              {pacientesSemRetorno.map((paciente) => (
                <div 
                  key={paciente.id} 
                  className="overdue-item"
                  onClick={() => navigate(`/pacientes/${paciente.id}`)}
                >
                  <div className="overdue-patient-info">
                    <span className="overdue-name">{paciente.nome}</span>
                    <span className="overdue-date">
                      Última consulta: {new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')} ({formatDaysAgo(paciente.ultima_consulta)})
                    </span>
                  </div>
                  <div className="overdue-action flex-center gap-1 text-emerald font-medium">
                    <span>Ver perfil</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
