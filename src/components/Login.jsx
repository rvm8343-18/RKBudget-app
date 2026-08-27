import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import "./Login.css";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid email or password.');
        }
    }

    return (
        <div>
            <h1 id="title">RK Budgeting</h1>
            <form id="login-form" onSubmit={handleSubmit}>
                <h2 id="header">Log in</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    id="pass"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button id="submit" type="submit">Submit</button>
            </form>
        </div>
    );
}