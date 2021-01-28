import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Row, Col } from 'reactstrap';
import countries from './../../countries';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from './../../../../components/Context';
import PlayerEntry from './Player';
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
	// const [forceLoad, setForceLoad] = useState(false);
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

	const loadPlayers = async (id?: string) => {
		await cxt.reload();
		if (id) {
			loadPlayer(id);
		}
	};

	const fileHandler = (files: FileList) => {
		if (!files) return;
		const file = files[0];
		if (!file) {
			setForm(prevForm => ({ ...prevForm, avatar: '' }));
			return;
		}
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
			setOpenState(false);
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

	const add = () => {
		loadEmpty();
		setOpenState(true);
	};

	useEffect(() => {
		loadEmpty();
		if (!data || !data.steamid) {
			setOpenState(false);
			return;
		}
		const player = cxt.players.find(player => player.steamid === data.steamid);
		if (!player) {
			setForm({ ...emptyPlayer, steamid: data.steamid });
		} else {
			setForm({ ...emptyPlayer, ...player });
		}
		setOpenState(true);
	}, [data]);

	return (
		<Form>
			<div className="tab-title-container">
				<div>Players</div>
				<Input
					type="text"
					name="name"
					id="player_search"
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
				deletePlayer={deletePlayer}
			/>
			<div className="tab-content-container no-padding">
				<div className="player-list-entry heading">
					<div className="picture">Avatar</div>
					<div className="realName">Real Name</div>
					<div className="username">Username</div>
					<div className="team">Team</div>
					<div className="country">Country</div>
					<div className="options"></div>
				</div>
				{cxt.players.filter(filterPlayers).map(player => (
					<PlayerEntry
						key={player._id}
						hash={cxt.hash}
						player={player}
						edit={() => edit(player)}
						team={cxt.teams.find(team => team._id === player.team)}
					/>
				))}
				<Row>
					<Col className="main-buttons-container">
						<Button color="primary" onClick={add}>
							+Add Player
						</Button>
					</Col>
				</Row>
			</div>
		</Form>
	);
};

export default PlayersTab;
