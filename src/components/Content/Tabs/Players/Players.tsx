import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Input, Row, Col, FormText } from 'reactstrap';
import countries from './../../countries';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from './../../../../components/Context';
import DragFileInput from './../../../DragFileInput';
import isSvg from '../../../../isSvg';
import PlayerEntry from './Player';
import { hash } from '../../../../hash';
import PlayerEditModal from './PlayerEditModal';

interface IProps {
	cxt: IContextData;
	data: any;
}

const PlayersTab = ({ cxt, data }: IProps) => {
	const emptyPlayer: I.Player = {
		_id: 'empty',
		firstName: '',
		lastName: '',
		username: '',
		avatar: '',
		country: '',
		steamid: '',
		team: ''
	};
	const [form, setForm] = useState(emptyPlayer);
	const [forceLoad, setForceLoad] = useState(false);
	const [openModalState, setOpenState] = useState(false);
	const [search, setSearch] = useState('');

	const clearAvatar = () => {
		const avatarInput: any = document.getElementById('avatar');
		if (avatarInput) avatarInput.value = '';
	};

	const loadPlayer = (id: string) => {
		const player = cxt.players.filter(player => player._id === id)[0];
		if (player) {
			setForm({ ...emptyPlayer, ...player });
			clearAvatar();
		}
	};

	const loadEmpty = () => {
		setForm({ ...emptyPlayer });
		clearAvatar();
	};

	const setPlayer = (event: any) => {
		if (event.target.value === 'empty') {
			//return this.setState({form:{...this.emptyPlayer}, filePath:''})
			return loadEmpty();
		}
		loadPlayer(event.target.value);
	};

	const loadPlayers = async (id?: string) => {
		await cxt.reload();
		if (id) {
			loadPlayer(id);
		}
	};

	const fileHandler = (files: FileList) => {
		if (!files || !files[0]) return;
		const file = files[0];
		if (!file.type.startsWith('image')) {
			return;
		}
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setForm(prevForm => ({ ...prevForm, avatar: reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '') }));
		};
	};

	const searchHandler = (event: any) => {
		setSearch(event.target.value);
	};

	const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.persist();
		const name = event.target.name as
			| 'steamid'
			| 'firstName'
			| 'lastName'
			| 'username'
			| 'avatar'
			| 'country'
			| 'team';

		if (!event.target.files) {
			return setForm(prevForm => ({
				...prevForm,
				[name]: name in form ? event.target.value : ''
			}));
		}

		return fileHandler(event.target.files);
	};

	const save = async () => {
		let response: any;
		if (form._id === 'empty') {
			response = await api.players.add(form);
		} else {
			let avatar = form.avatar;
			if (avatar && avatar.includes('api/players/avatar')) {
				avatar = undefined as any;
			}
			response = await api.players.update(form._id, { ...form, avatar });
		}
		if (response && response._id) {
			loadPlayers(response._id);
		}
	};

	const deletePlayer = async () => {
		if (form._id === 'empty') return;
		const response = await api.players.delete(form._id);
		if (response) {
			await loadPlayers();
			return loadEmpty();
		}
	};

	const edit = (player: I.Player) => {
		setForm(player);
		setOpenState(true);
	};

	const filterPlayers = (player: I.Player): boolean => {
		const str = search.toLowerCase();
		const country = countries.find(country => country.value === player.country);
		const team = cxt.teams.find(team => team._id === player.team);
		return (
			player._id.toLowerCase().includes(str) ||
			player.firstName.toLowerCase().includes(str) ||
			player.lastName.toLowerCase().includes(str) ||
			player.username.toLowerCase().includes(str) ||
			player.steamid.toLowerCase().includes(str) ||
			(team && (team.name.toLowerCase().includes(str) || team.shortName.toLowerCase().includes(str))) ||
			(country && (country.value.toLowerCase().includes(str) || country.label.toLowerCase().includes(str)))
		);
	};

	useEffect(() => {
		// Load player
	}, [data]);

	return (
		<Form>
			<div className="tab-title-container">
				<div>Players</div>
				<Input
					type="text"
					name="name"
					id="team_search"
					value={search}
					onChange={searchHandler}
					placeholder="Search..."
				/>
			</div>
			<PlayerEditModal
				open={openModalState}
				toggle={() => {
					setOpenState(!openModalState);
				}}
				player={form}
				teams={cxt.teams}
				onChange={changeHandler}
				onFileChange={fileHandler}
				save={save}
			/>
			<div className="tab-content-container list-padding full-scroll">
				<div className="player-list-entry heading">
					<div className="position">No.</div>
					<div className="picture">Avatar</div>
					<div className="realName">Real Name</div>
					<div className="username">Username</div>
					<div className="team">Team</div>
					<div className="country">Country</div>
				</div>
				{cxt.players.filter(filterPlayers).map((player, no) => (
					<PlayerEntry
						no={no}
						key={player._id}
						player={player}
						edit={() => edit(player)}
						team={cxt.teams.find(team => team._id === player.team)}
					/>
				))}
			</div>
		</Form>
	);
};

export default PlayersTab;
/*
export default class Players extends React.Component<
	{ cxt: IContextData; data: any },
	{ options: any[]; value: string; form: I.Player; forceLoad: boolean; search: string }
> {
	emptyPlayer: I.Player;
	constructor(props: { cxt: IContextData; data: any }) {
		super(props);
		this.emptyPlayer = {
			_id: 'empty',
			firstName: '',
			lastName: '',
			username: '',
			avatar: '',
			country: '',
			steamid: '',
			team: ''
		};

		this.state = {
			options: countries,
			value: '',
			form: { ...this.emptyPlayer },
			forceLoad: false,
			search: ''
		};
	}

	componentDidMount() {
		//this.loadPlayers();
	}

	componentDidUpdate(pProps: any) {
		if (this.props.data && this.props.data.steamid && !this.state.forceLoad) {
			this.setState({ form: { ...this.emptyPlayer, steamid: this.props.data.steamid }, forceLoad: true }, () => {
				const player = this.props.cxt.players.filter(player => player.steamid === this.props.data.steamid)[0];
				if (player) this.loadPlayer(player._id);
			});
		} else if (!this.props.data && pProps.data && pProps.data.steamid === this.state.form.steamid) {
			this.setState({ form: { ...this.emptyPlayer, steamid: '' } }, this.clearAvatar);
		}
		if (!this.props.data && this.state.forceLoad) {
			this.setState({ forceLoad: false });
		}
	}

	loadPlayers = async (id?: string) => {
		await this.props.cxt.reload();
		if (id) {
			this.loadPlayer(id);
		}
	};

	loadPlayer = (id: string) => {
		const player = this.props.cxt.players.filter(player => player._id === id)[0];
		if (player) this.setState({ form: { ...this.emptyPlayer, ...player } }, this.clearAvatar);
	};

	loadEmpty = () => {
		this.setState({ form: { ...this.emptyPlayer } }, this.clearAvatar);
	};

	clearAvatar = () => {
		const avatarInput: any = document.getElementById('avatar');
		if(avatarInput) avatarInput.value = '';
	};

	setPlayer = (event: any) => {
		if (event.target.value === 'empty') {
			//return this.setState({form:{...this.emptyPlayer}, filePath:''})
			return this.loadEmpty();
		}
		this.loadPlayer(event.target.value);
	};

	fileHandler = (files: FileList) => {
		if (!files || !files[0]) return;
		const file = files[0];
		const { form } = this.state;
		if (!file.type.startsWith('image')) {
			return;
		}
		const reader: any = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			form.avatar = reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '');
			this.setState({ form });
		};
	};
	searchHandler = (event: any) => {
		this.setState({ search: event.target.value });
	};
	changeHandler = (event: any) => {
		const name: 'steamid' | 'firstName' | 'lastName' | 'username' | 'avatar' | 'country' | 'team' =
			event.target.name;
		const { form } = this.state;

		if (!event.target.files) {
			if (!(name in form)) {
				form[name] = '';
			}
			form[name] = event.target.value;
			return this.setState({ form });
		}

		return this.fileHandler(event.target.files);
	};

	save = async () => {
		const { form } = this.state;
		let response: any;
		if (form._id === 'empty') {
			response = await api.players.add(form);
		} else {
			let avatar = form.avatar;
			if (avatar && avatar.includes('api/players/avatar')) {
				avatar = undefined as any;
			}
			response = await api.players.update(form._id, { ...form, avatar });
		}
		if (response && response._id) {
			this.loadPlayers(response._id);
		}
	};
	delete = async () => {
		if (this.state.form._id === 'empty') return;
		const response = await api.players.delete(this.state.form._id);
		if (response) {
			await this.loadPlayers();
			return this.loadEmpty();
		}
	};

	filterPlayers = (player: I.Player): boolean => {
		const str = this.state.search.toLowerCase();
		const country = countries.find(country => country.value === player.country);
		const team = this.props.cxt.teams.find(team => team._id === player.team);
		return (
			player._id.toLowerCase().includes(str) ||
			player.firstName.toLowerCase().includes(str) ||
			player.lastName.toLowerCase().includes(str) ||
			player.username.toLowerCase().includes(str) ||
			player.steamid.toLowerCase().includes(str) ||
			(team && (team.name.toLowerCase().includes(str) || team.shortName.toLowerCase().includes(str))) ||
			(country && (country.value.toLowerCase().includes(str) || country.label.toLowerCase().includes(str)))
		);
	};

	render() {
		const { form } = this.state;
		let avatar = '';
		if (form.avatar) {
			if (form.avatar.includes('api/players/avatar')) {
				avatar = `${form.avatar}?hash=${hash()}`;
			} else {
				const encoding = isSvg(Buffer.from(form.avatar, 'base64')) ? 'svg+xml' : 'png';
				avatar = `data:image/${encoding};base64,${form.avatar}`;
			}
		}
		return (
			<Form>
				<div className="tab-title-container">
					<div>Players</div>
					<Input
						type="text"
						name="name"
						id="team_search"
						value={this.state.search}
						onChange={this.searchHandler}
						placeholder="Search..."
					/>
				</div>
				<PlayerEditModal
					open={this.state.op}
				/>
				<div className="tab-content-container no-padding full-scroll">
					<div className="player-list-entry heading">
						<div className="position">No.</div>
						<div className="picture">Avatar</div>
						<div className="realName">Real Name</div>
						<div className="username">Username</div>
						<div className="team">Team</div>
						<div className="country">Country</div>
					</div>
					{this.props.cxt.players.filter(this.filterPlayers).map(player => (
						<PlayerEntry
							key={player._id}
							player={player}
							team={this.props.cxt.teams.find(team => team._id === player.team)}
						/>
					))}
				</div>
			</Form>
		);
		return (
			<Form>
				<div className="tab-title-container">
					<div>Players</div>
					<Input
						type="text"
						name="name"
						id="team_search"
						value={this.state.search}
						onChange={this.searchHandler}
						placeholder="Search..."
					/>
				</div>
				<div className="tab-content-container">
					<FormText color="muted">
						Player: {form._id || form._id !== 'empty' ? form._id : '--- NONE ---'}
					</FormText>
					<FormGroup>
						<Input type="select" name="players" id="players" onChange={this.setPlayer} value={form._id}>
							<option value={'empty'}>New player</option>
							{this.props.cxt.players
								.concat()
								.filter(this.filterPlayers)
								.sort((a, b) => (a.username < b.username ? -1 : 1))
								.map(player => (
									<option key={player._id} value={player._id}>
										{player.firstName} {player.username} {player.lastName}
									</option>
								))}
						</Input>
					</FormGroup>
					<Row>
						<Col md="4">
							<FormGroup>
								<Input
									type="text"
									name="firstName"
									id="first_name"
									onChange={this.changeHandler}
									value={form.firstName}
									placeholder="First Name"
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<Input
									type="text"
									name="username"
									id="nick"
									onChange={this.changeHandler}
									value={form.username}
									placeholder="Nickname"
								/>
							</FormGroup>
						</Col>
						<Col md="4">
							<FormGroup>
								<Input
									type="text"
									name="lastName"
									id="last_name"
									onChange={this.changeHandler}
									value={form.lastName}
									placeholder="Last Name"
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col md="6">
							<FormGroup>
								<Input
									type="select"
									id="country"
									name="country"
									value={form.country}
									onChange={this.changeHandler}
								>
									<option value="">Country</option>
									{this.state.options.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Input>
							</FormGroup>
						</Col>
						<Col md="6">
							<FormGroup>
								<Input
									id="steamid"
									type="text"
									name="steamid"
									value={form.steamid}
									onChange={this.changeHandler}
									placeholder="SteamID64"
								/>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col md="12">
							<FormGroup>
								<Input
									type="select"
									id="player_teams"
									name="team"
									value={form.team}
									onChange={this.changeHandler}
								>
									<option value="">Team</option>
									{this.props.cxt.teams
										.concat()
										.sort((a, b) => (a.name < b.name ? -1 : 1))
										.map(team => (
											<option key={team._id} value={team._id}>
												{team.name}
											</option>
										))}
								</Input>
							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col md="12">
							<FormGroup>
								<DragFileInput
									image
									onChange={this.fileHandler}
									id="avatar"
									label="UPLOAD PROFILE PICTURE"
									imgSrc={avatar}
								/>
								<FormText color="muted">
									Avatar to be used for player images instead of the default from Steam
								</FormText>

							</FormGroup>
						</Col>
					</Row>
					<Row>
						<Col className="main-buttons-container">
							<Button color="secondary" onClick={this.delete} disabled={this.state.form._id === 'empty'}>
								Delete
							</Button>
							<Button color="primary" onClick={this.save}>
								{this.state.form._id === 'empty' ? '+Add player' : 'Save'}
							</Button>
						</Col>
					</Row>
				</div>
			</Form>
		);
	}
}
*/
