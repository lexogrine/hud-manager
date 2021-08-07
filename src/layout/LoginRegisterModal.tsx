import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Input, Button, ModalFooter } from 'reactstrap';
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

	return (
		<Modal isOpen={isOpen} toggle={() => {}} className="veto_modal">
			<ModalHeader>Login</ModalHeader>
			<div className="veto_type">
				<div className={`type active`}>Login</div>
				<a
					className={`type`}
					href="https://lexogrine.com/manager/register"
					rel="noopener noreferrer"
					target="_blank"
				>
					Register
				</a>
			</div>
			<ModalBody>
				{error ? <p className="login-error">{error}</p> : null}
				<FormGroup>
					<Input
						name="email"
						type="email"
						id="email"
						placeholder="Email"
						value={email}
						onChange={handleChange(setEmail)}
						onKeyDown={onEnter}
					/>
				</FormGroup>
				<FormGroup>
					<Input
						name="password"
						type="password"
						id="password"
						placeholder="Password"
						value={password}
						onChange={handleChange(setPassword)}
						onKeyDown={onEnter}
					/>
				</FormGroup>
				<FormGroup>
					<Input
						name="totp"
						type="text"
						id="totp"
						placeholder="2FA Token"
						value={token}
						onChange={handleChange(setToken)}
						onKeyDown={onEnter}
					/>
				</FormGroup>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" onClick={login} disabled={loading} className="modal-save">
					Login
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default LoginRegisterModal;
