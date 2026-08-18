import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/neon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (err) => {
    const message = err?.message || err?.error?.message || (typeof err === 'string' ? err : '');
    const code = err?.code || '';

    if (code === 'INVALID_EMAIL_OR_PASSWORD' || message.includes('Invalid email or password') || message.includes('Invalid credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (code === 'USER_NOT_FOUND' || message.includes('User not found')) {
      return 'Usuário não encontrado.';
    }
    return message || 'Falha ao fazer login. Verifique suas credenciais.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res?.error) {
        setError(getErrorMessage(res.error));
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <h1 className="logo-text">NutriSystem</h1>
        </div>
        
        <h2 className="auth-title">Bem-vindo(a) de volta</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>Não tem conta? </span>
          <Link to="/register" className="auth-link">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
