import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, User, Calendar, Phone } from 'lucide-react';
import { authClient, sql } from '../lib/neon';

export default function Pacientes() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacientes = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const rows = await sql`
          SELECT id, nome, email, telefone, data_nascimento, created_at 
          FROM public.pacientes 
          WHERE nutricionista_id = ${session.user.id}
          ORDER BY nome ASC
        `;
        setPacientes(rows);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [session]);

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.telefone && p.telefone.includes(search))
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Gerencie os pacientes cadastrados em seu consultório</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={() => alert('Cadastro de pacientes será implementado no próximo prompt.')}>
          <UserPlus size={18} />
          <span>Novo Paciente</span>
        </button>
      </header>

      <div className="content-card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar paciente por nome, e-mail ou telefone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Carregando pacientes...</div>
        ) : filteredPacientes.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="empty-icon" />
            <p className="empty-title">
              {search ? 'Nenhum paciente encontrado para esta busca.' : 'Você ainda não possui pacientes cadastrados.'}
            </p>
          </div>
        ) : (
          <div className="patients-grid">
            {filteredPacientes.map((paciente) => (
              <div 
                key={paciente.id} 
                className="patient-card"
                onClick={() => navigate(`/pacientes/${paciente.id}`)}
              >
                <div className="patient-card-avatar">
                  {paciente.nome.charAt(0).toUpperCase()}
                </div>
                <div className="patient-card-info">
                  <h3 className="patient-name">{paciente.nome}</h3>
                  {paciente.email && <p className="patient-detail">{paciente.email}</p>}
                  {paciente.telefone && (
                    <p className="patient-detail flex-center-start gap-1">
                      <Phone size={14} />
                      <span>{paciente.telefone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
