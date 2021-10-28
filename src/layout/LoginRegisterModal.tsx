import { useState } from 'react';
import LabeledInput from '../components/LabeledInput';
import api from './../api/api';
interface IProps {
	isOpen: boolean;
	loading: boolean;
	setLoading: (loading: boolean, error?: string) => void;
	loadUser: () => void;
	error: string;
}

const LoginRegisterModal = ({ isOpen, loading, setLoading, loadUser, error }: IProps) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [token, setToken] = useState('');

	const handleChange =
		(setValue: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
		};
	const login = async () => {
		setLoading(true);
		try {
			const loginResponse = await api.user.login(email, password, token);
			if (!loginResponse.success) {
				if (error === 'You need to pass your one-time token') {
					setToken('');
				}
				return setLoading(false, loginResponse.message);
			}
			setEmail('');
			setPassword('');
			setToken('');
			loadUser();
			setLoading(false);
		} catch {
			return setLoading(false, 'It seems that our servers are unreachable. Please try again in a few minutes');
		}
	};
	const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') login();
	};

	if (!isOpen) return null;

	const showToken = error === 'You need to pass your one-time token';

	return (
		<div className="login-view">
			<div className="logo">LHM</div>
			<div className="container">
				{error ? <p className="login-error">{error}</p> : null}
				<div style={{ display: showToken ? 'none' : 'block' }}>
					<LabeledInput
						name="email"
						type="email"
						label="Email"
						id="email"
						placeholder="Email"
						value={email}
						onChange={handleChange(setEmail)}
						onKeyDown={onEnter}
						tabIndex={0}
					/>
				</div>
				<div style={{ display: showToken ? 'none' : 'block' }}>
					<LabeledInput
						name="password"
						type="password"
						id="password"
						label="Password"
						placeholder="Password"
						value={password}
						onChange={handleChange(setPassword)}
						onKeyDown={onEnter}
						tabIndex={0}
					/>
				</div>
				<div style={{ display: showToken ? 'none' : 'block' }}>
					<div className="forget_password">
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://lexogrine.com/manager/remember"
							tabIndex={-1}
						>
							Forgot Password?
						</a>
					</div>
				</div>
				<div style={{ display: !showToken ? 'none' : 'block' }}>
					<LabeledInput
						name="totp"
						type="text"
						id="totp"
						label="2FA Token"
						placeholder="2FA Token"
						value={token}
						onChange={handleChange(setToken)}
						onKeyDown={onEnter}
						tabIndex={0}
					/>
				</div>
				<div
					onClick={loading ? undefined : login}
					className={`button big strong green wide ${loading ? 'disabled' : ''}`}
				>
					Login
				</div>
				<div className="register">
					Don’t have an account?{' '}
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://lexogrine.com/manager/register"
						tabIndex={-1}
					>
						Register now!
					</a>
				</div>
			</div>
		</div>
	);
};

export default LoginRegisterModal;
