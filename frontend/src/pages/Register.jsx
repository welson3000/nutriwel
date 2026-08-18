import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/neon';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (err) => {
    const message = err?.message || err?.error?.message || (typeof err === 'string' ? err : '');
    const code = err?.code || '';

    if (code === 'PASSWORD_TOO_SHORT' || message.includes('Password too short') || message.includes('too short')) {
      return 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (code === 'USER_ALREADY_EXISTS' || message.includes('already exists') || message.includes('User already exists')) {
      return 'Este e-mail já está cadastrado. Tente fazer login.';
    }
    if (code === 'INVALID_EMAIL' || message.includes('Invalid email')) {
      return 'Por favor, insira um e-mail válido.';
    }
    return message || 'Falha ao criar conta. Tente novamente.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name,
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
      <div className="auth-card register-card">
        <div className="logo-container">
          <h1 className="logo-text">NutriSystem</h1>
        </div>
        
        <h2 className="auth-title">Crie sua conta</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

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
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              minLength={8}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span>Já tem conta? </span>
          <Link to="/login" className="auth-link">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
