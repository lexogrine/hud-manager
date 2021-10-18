import { useState, useEffect } from 'react';
import countries from './../../countries';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from './../../../../components/Context';
import PlayerEntry from './Player';
import PlayerEditModal from './PlayerEditModal';
import CustomFieldsModal from '../../../CustomFields/CustomFieldsModal';
import { useTranslation } from 'react-i18next';
import NamesFileModal from './NamesFileModal';
import { ReactComponent as DeleteIcon } from './../../../../styles/icons/bin.svg';
import { ReactComponent as EditIcon } from './../../../../styles/icons/pencil.svg';
import ImportPlayerModal from './ImportPlayersModal';
import Checkbox from '../../../Checkbox';
// import { GameOnly } from '../Config/Config';
// import downloadIcon from './../../../../styles/downloadHUDIcon.png';

interface IProps {
	cxt: IContextData;
	data: any;
}

const quickClone: <T>(obj: T) => T = obj => JSON.parse(JSON.stringify(obj));

const PlayersTab = ({ cxt, data }: IProps) => {
	const emptyPlayer: I.Player = {
		_id: 'empty',
		firstName: '',
		lastName: '',
		username: '',
		avatar: '',
		country: '',
		game: cxt.game,
		steamid: '',
		team: '',
		extra: {}
	};
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
	const [form, setForm] = useState(emptyPlayer);
	const [search] = useState('');

	const [isFilesOpened, setFilesOpened] = useState(false);

	const [sortBy, setSortBy] = useState<keyof I.Player>('username');
	const [sortByType, setSortByType] = useState<'DESC' | 'ASC'>('ASC');

	const [editModalState, setEditState] = useState(false);
	const [fieldsModalState, setFieldsState] = useState(false);
	const [importModalState, setImportState] = useState(false);

	const [customFieldForm, setCustomFieldForm] = useState<I.CustomFieldEntry[]>(quickClone(cxt.fields.players));

	const openCustomFields = () => {
		setCustomFieldForm(quickClone(cxt.fields.players));
		setFieldsState(true);
	};

	const togglePlayer = (id: string) => {
		setSelectedPlayers(
			selectedPlayers.includes(id)
				? selectedPlayers.filter(playerId => playerId !== id)
				: [...selectedPlayers, id]
		);
	};

	const deletePlayers = async () => {
		if (!selectedPlayers.length) return;
		await api.players.delete(selectedPlayers);
		setSelectedPlayers([]);
		await cxt.reload();
	};

	const sortPlayers = (players: I.Player[]) => {
		const sortType = (result: -1 | 1) => {
			if (sortByType === 'ASC') return result;
			return result * -1;
		};
		if (sortBy === 'team') {
			return [...players].sort((a, b) => {
				const [aTeam, bTeam] = [
					cxt.teams.find(team => team._id === a.team),
					cxt.teams.find(team => team._id === b.team)
				];
				if (!a.team || !aTeam) return sortType(-1);
				else if (!b.team || !bTeam) return sortType(1);
				return sortType(aTeam.name < bTeam.name ? -1 : 1);
			});
		}
		return [...players].sort((a, b) => sortType((a[sortBy] as any) < (b[sortBy] as any) ? -1 : 1));
	};

	const toggleSortBy = (targetSortBy: keyof I.Player) => () => {
		if (targetSortBy === sortBy) {
			return setSortByType(sortByType === 'ASC' ? 'DESC' : 'ASC');
		}
		setSortBy(targetSortBy);
	};

	const saveFields = async () => {
		await api.players.fields.update(customFieldForm.filter(fieldEntry => fieldEntry.name));
		cxt.reload();
		setFieldsState(false);
	};

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

	/*const searchHandler = (event: any) => {
		setSearch(event.target.value);
	};*/

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
			setEditState(false);
			await cxt.reload();
		}
	};

	const deletePlayer = async () => {
		if (form._id === 'empty') return;
		const response = await api.players.delete(form._id);
		console.log(response);
		if (response) {
			setEditState(false);
			await loadPlayers();
			loadEmpty();
		}
	};

	const edit = (player: I.Player) => {
		setForm(player);
		setEditState(true);
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
		setEditState(true);
	};

	const extraChangeHandler = (field: string, type: Exclude<I.PanelInputType, 'select' | 'action' | 'checkbox'>) => {
		const fileHandler = (files: FileList) => {
			if (!files) return;
			const file = files[0];
			if (!file) {
				setForm(prevForm => ({ ...prevForm, logo: '' }));
				return;
			}
			if (!file.type.startsWith('image')) {
				return;
			}
			const reader: any = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				setForm({
					...form,
					extra: { ...form.extra, [field]: reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '') }
				});
			};
		};
		if (type === 'image') {
			return fileHandler;
		}
		if (type === 'color') {
			return (hex: string) => {
				setForm({ ...form, extra: { ...form.extra, [field]: hex } });
			};
		}
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			setForm({ ...form, extra: { ...form.extra, [field]: event.target.value } });
		};
	};

	useEffect(() => {
		loadEmpty();
		if (!data || !data.steamid) {
			setEditState(false);
			return;
		}
		const player = cxt.players.find(player => player.steamid === data.steamid);
		if (!player) {
			setForm({ ...emptyPlayer, steamid: data.steamid });
		} else {
			setForm({ ...emptyPlayer, ...player });
		}
		setEditState(true);
	}, [data]);

	const togglePlayers = () => {
		if (selectedPlayers.length === cxt.players.length) {
			setSelectedPlayers([]);
			return;
		}

		setSelectedPlayers(cxt.players.map(player => player._id));
	};

	const visibleFields = cxt.fields.players.filter(field => field.visible);
	const { t } = useTranslation();
	if (editModalState) {
		return (
			<PlayerEditModal
				open={editModalState}
				toggle={() => {
					setEditState(!editModalState);
				}}
				player={form}
				onChange={changeHandler}
				onFileChange={fileHandler}
				onExtraChange={extraChangeHandler as I.onExtraChangeFunction}
				save={save}
				deletePlayer={deletePlayer}
				fields={cxt.fields.teams}
				cxt={cxt}
				teams={cxt.teams}
			/>
		);
	}

	return (
		<>
			{/*<div className="tab-title-container">
				<div className="tab-title">
					{t('common.players')}
					<GameOnly game="csgo">
						<div onClick={() => setFilesOpened(true)}>
							<img src={downloadIcon} alt="Download Names file" />
						</div>
					</GameOnly>
				</div>
				<Input
					type="text"
					name="name"
					id="player_search"
					value={search}
					onChange={searchHandler}
					placeholder={t('common.search')}
				/>
			</div>*/}
			<ImportPlayerModal
				open={importModalState}
				cxt={cxt}
				toggle={() => {
					setImportState(!importModalState);
				}}
			/>
			<NamesFileModal
				isOpen={isFilesOpened}
				toggle={() => setFilesOpened(!isFilesOpened)}
				players={cxt.players}
			/>
			<CustomFieldsModal
				fields={customFieldForm}
				open={fieldsModalState}
				toggle={() => {
					setFieldsState(!fieldsModalState);
				}}
				setForm={setCustomFieldForm}
				save={saveFields}
			/>
			<div className="tab-content-container no-padding">
				<div className="item-list-entry heading">
					<div className="picture">Avatar</div>
					<div className="realName" onClick={toggleSortBy('firstName')}>
						{t('common.realName')}
					</div>
					<div className="username" onClick={toggleSortBy('username')}>
						{t('common.nickname')}
					</div>
					<div className="team" onClick={toggleSortBy('team')}>
						{t('common.team')}
					</div>
					<div className="country" onClick={toggleSortBy('country')}>
						{t('common.country')}
					</div>
					{visibleFields.map(field => (
						<div className="custom-field" key={field._id}>
							{field.name}
						</div>
					))}
					<div className="options">
						<EditIcon className="image-button transparent" onClick={openCustomFields} />
						<DeleteIcon
							onClick={deletePlayers}
							className="image-button transparent"
							style={{ marginLeft: 18 }}
						/>
						<Checkbox
							checked={selectedPlayers.length > 0}
							onChange={togglePlayers}
							semiChecked={!!(selectedPlayers.length && selectedPlayers.length < cxt.players.length)}
						/>
					</div>
				</div>
				{sortPlayers(cxt.players.filter(filterPlayers)).map(player => (
					<PlayerEntry
						key={player._id}
						hash={cxt.hash}
						player={player}
						edit={() => edit(player)}
						team={cxt.teams.find(team => team._id === player.team)}
						cxt={cxt}
						isChecked={selectedPlayers.includes(player._id)}
						fields={visibleFields}
						togglePlayer={togglePlayer}
					/>
				))}
			</div>
			<div className="action-container">
				<div className="button green empty big wide" onClick={() => setImportState(true)}>
					Import players
				</div>
				<div className="button green strong big wide" onClick={add}>
					{t('players.addPlayer')}
				</div>
			</div>
		</>
	);
};

export default PlayersTab;
