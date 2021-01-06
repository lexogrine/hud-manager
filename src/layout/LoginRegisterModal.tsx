import React from 'react';
import { Modal, ModalHeader, ModalBody, FormGroup, Input, Button, ModalFooter } from 'reactstrap';
import api from './../api/api';
import * as I from './../api/interfaces';
interface IProps {
	isOpen: boolean;
	loading: boolean;
	setLoading: (loading: boolean, error?: string) => void;
	setUser: (user: I.Customer) => void;
	error: string;
	version: string;
}
interface IState {
	type: 'login' | 'register';
	email: string;
	password: string;
}

export default class LoginRegisterModal extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			type: 'login',
			email: '',
			password: ''
		};
	}
	handleChange = (field: 'email' | 'type' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ [field]: e.target.value } as any);
	};
	login = async () => {
		const { setLoading, setUser, version } = this.props;
		setLoading(true);
		try {
			const loginResponse = await api.user.login(this.state.email, this.state.password, version);
			if (loginResponse !== true) return setLoading(false, 'Incorrect email or password');

			const machine = await api.machine.get();
			const userToken = await api.user.get(machine.id);

			if (!userToken)
				return setLoading(false, 'It seems that your session has expired - please restart & login again');

			if ('error' in userToken) {
				return setLoading(false, userToken.error);
			}

			const userData = await api.user.verify(userToken.token);

			if (!userData)
				return setLoading(false, 'It seems that your session has expired - please restart & login again');

			setUser(userData);
			setLoading(false);
		} catch {
			return setLoading(false, 'It seems that our servers are unreachable. Please try again in a few minutes');
		}
	};
	onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') this.login();
	};
	render() {
		const { password, email } = this.state;
		const { isOpen, loading, error } = this.props;
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
							onChange={this.handleChange('email')}
							onKeyDown={this.onEnter}
						/>
					</FormGroup>
					<FormGroup>
						<Input
							name="password"
							type="password"
							id="password"
							placeholder="Password"
							value={password}
							onChange={this.handleChange('password')}
							onKeyDown={this.onEnter}
						/>
					</FormGroup>
				</ModalBody>
				<ModalFooter className="no-padding">
					<Button color="primary" onClick={this.login} disabled={loading} className="modal-save">
						Login
					</Button>
				</ModalFooter>
			</Modal>
		);
	}
}
