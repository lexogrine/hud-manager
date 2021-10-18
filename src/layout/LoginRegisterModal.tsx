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
				return setLoading(false, loginResponse.message);
			}
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

	return (
		<div className="login-view">
			<div className="logo">LHM</div>
			<div className="container">
				{error ? <p className="login-error">{error}</p> : null}
				<LabeledInput
					name="email"
					type="email"
					label="Email"
					id="email"
					placeholder="Email"
					value={email}
					onChange={handleChange(setEmail)}
					onKeyDown={onEnter}
				/>
				<LabeledInput
					name="password"
					type="password"
					id="password"
					label="Password"
					placeholder="Password"
					value={password}
					onChange={handleChange(setPassword)}
					onKeyDown={onEnter}
				/>
				<div className="forget_password">
					<a target="_blank" rel="noopener noreferrer" href="https://lexogrine.com/manager/remember">
						Forgot Password?
					</a>
				</div>
				<LabeledInput
					name="totp"
					type="text"
					id="totp"
					label="2FA Token"
					placeholder="2FA Token"
					value={token}
					onChange={handleChange(setToken)}
					onKeyDown={onEnter}
				/>
				<div
					onClick={loading ? undefined : login}
					className={`button big strong green wide ${loading ? 'disabled' : ''}`}
				>
					Login
				</div>
				<div className="register">
					Don’t have an account?{' '}
					<a target="_blank" rel="noopener noreferrer" href="https://lexogrine.com/manager/register">
						Register now!
					</a>
				</div>
			</div>
		</div>
	);
};

export default LoginRegisterModal;
