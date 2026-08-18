import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Phone, Mail, Activity } from 'lucide-react';
import { authClient, sql } from '../lib/neon';

export default function PacientePerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaciente = async () => {
      if (!session?.user?.id || !id) return;
      try {
        setLoading(true);
        const [pacienteRow] = await sql`
          SELECT * FROM public.pacientes 
          WHERE id = ${id} AND nutricionista_id = ${session.user.id}
        `;
        setPaciente(pacienteRow || null);

        if (pacienteRow) {
          const consultasRows = await sql`
            SELECT * FROM public.consultas 
            WHERE paciente_id = ${id}
            ORDER BY data_consulta DESC
          `;
          setConsultas(consultasRows);
        }
      } catch (err) {
        console.error('Erro ao buscar perfil do paciente:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [session, id]);

  if (loading) {
    return <div className="loading-screen">Carregando perfil...</div>;
  }

  if (!paciente) {
    return (
      <div className="page-container">
        <Link to="/pacientes" className="btn-back flex-center-start gap-1">
          <ArrowLeft size={18} />
          <span>Voltar para pacientes</span>
        </Link>
        <div className="empty-state">
          <User size={48} className="empty-icon" />
          <p className="empty-title">Paciente não encontrado ou acesso não autorizado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/dashboard" className="btn-back flex-center-start gap-1">
        <ArrowLeft size={18} />
        <span>Voltar ao Dashboard</span>
      </Link>

      <header className="patient-profile-header">
        <div className="patient-avatar-large">
          {paciente.nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="page-title">{paciente.nome}</h1>
          <p className="page-subtitle">Perfil do Paciente</p>
        </div>
      </header>

      <div className="dashboard-grid grid-2-1">
        <div className="content-card">
          <h2 className="card-title">Informações Pessoais</h2>
          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">E-mail</span>
              <span className="detail-value">{paciente.email || 'Não informado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Telefone</span>
              <span className="detail-value">{paciente.telefone || 'Não informado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sexo</span>
              <span className="detail-value">{paciente.sexo || 'Não informado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Data de Nascimento</span>
              <span className="detail-value">
                {paciente.data_nascimento 
                  ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') 
                  : 'Não informada'}
              </span>
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2 className="card-title">Histórico de Consultas</h2>
          {consultas.length === 0 ? (
            <p className="empty-text">Nenhuma consulta registrada até o momento.</p>
          ) : (
            <div className="consultations-list">
              {consultas.map((c) => (
                <div key={c.id} className="consultation-item">
                  <div className="consultation-date flex-center-start gap-1">
                    <Calendar size={16} />
                    <span>{new Date(c.data_consulta).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {c.peso && <span className="consultation-weight">{c.peso} kg</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
