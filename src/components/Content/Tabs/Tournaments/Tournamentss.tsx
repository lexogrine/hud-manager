import { useState } from 'react';
import { Button } from 'reactstrap';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from './../../../../components/Context';
//import TeamEditModal from './TeamEditModal';
import TournamentEntry from './TournamentEntry';
import { useTranslation } from 'react-i18next';
import TournamentEdit, { TournamentForm } from './TournamentEdit';
import Tournament from './Tournament';

interface IProps {
    cxt: IContextData;
}
const tournamentToForm = (tournament: I.Tournament): TournamentForm => ({ _id: tournament._id, name: tournament.name, logo: tournament.logo, playoffTeams: tournament.playoffs.teams, groupParticipants: tournament.groups?.[0]?.participants || [], participants: tournament.playoffs.participants, playoffType: tournament.playoffs.type, groupType: tournament.groups?.[0]?.type || 'swiss', groupTeams: tournament.groups?.[0]?.teams || 0, phases: tournament.playoffs.phases, groupPhases: tournament.groups?.[0]?.phases || 0 })

const Tournamentss = ({ cxt }: IProps) => {
    const emptyTournament: TournamentForm = {
        _id: 'empty',
        name: '',
        logo: '',
        playoffTeams: 0,
        groupTeams: 0,
        playoffType: 'single',
        groupType: 'swiss',
        phases: 0,
        groupPhases: 0,
        participants: [],
        groupParticipants: []
    };
    const [form, setForm] = useState(emptyTournament);
    const [isEditing, setEditState] = useState(false);

    const [ showing, setShowing ] = useState<string | null>(null);

    const { t } = useTranslation();

    const clearAvatar = () => {
        //const avatarInput: any = document.getElementById('avatar');
        //if (avatarInput) avatarInput.value = '';
    };

    const loadTournament = (id: string) => {
        const tournament = cxt.tournaments.filter(tournament => tournament._id === id)[0];
        if (tournament) {
            setForm(tournamentToForm(tournament));
            clearAvatar();
        }
    };

    const loadEmpty = () => {
        setForm({ ...emptyTournament });
        clearAvatar();
    };

    const loadTournaments = async (id?: string) => {
        await cxt.reload();
        if (id) {
            loadTournament(id);
        }
    };


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
            setForm(prevForm => ({ ...prevForm, logo: reader.result.replace(/^data:([a-z]+)\/(.+);base64,/, '') }));
        };
    };

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist?.();
        const name = event.target.name as 'name' | 'shortName' | 'logo' | 'country';

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
            response = await api.tournaments.add(form);
        } else {
            let logo = form.logo;
            logo = undefined as any;
            /*
            if (logo && logo.includes('api/tournaments/logo')) {
                logo = undefined as any;
            }*/
            response = await api.tournaments.update(form._id, { name: form.name, logo });
        }
        if (response && response._id) {
            await loadTournaments();
            setShowing(null)
        }
    };

    /*const deleteTournament = async () => {
        if (form._id === 'empty') return;
        const response = await api.tournaments.delete(form._id);
        if (response) {
            setEditState(false);
            await loadTournaments();
            return loadEmpty();
        }
    };*/

    const edit = (tournament: I.Tournament) => {
        setForm(tournamentToForm(tournament));
        setEditState(true);
        if ((false as any)) {
            console.log(isEditing, save, changeHandler);
        }
    };


    const add = () => {
        loadEmpty();
        setEditState(true);
    };

    const content = () => {
        const visibleFields = cxt.fields.teams.filter(field => field.visible);

        if (isEditing) {
            return <TournamentEdit cxt={cxt} tournament={form} onChange={changeHandler} save={save} close={() => setEditState(false)} />
        }

        if(showing){
            const tournament = cxt.tournaments.find(tournament => tournament._id === showing);
            if(!tournament) return null;
            return <Tournament cxt={cxt} tournament={tournament} close={() => setShowing(null)} />
        }

        return (
            <>
                <div className="tab-content-container no-padding">
                    <div className="item-list-entry heading">
                        <div className="picture">Logo</div>
                        <div className="name">
                            {t('common.teamName')}
                        </div>
                        <div className="options">
                            <Button className="purple-btn round-btn">
                                {t('common.manage')}
                            </Button>
                        </div>
                    </div>
                    {cxt.tournaments.map(team => (
                        <TournamentEntry
                            hash={cxt.hash}
                            key={team._id}
                            team={team}
                            edit={() => edit(team)}
                            show={() => setShowing(team._id)}
                            fields={visibleFields}
                            cxt={cxt}
                        />
                    ))}
                </div>
                <div className="action-container">
                    <div className="button green empty big wide" onClick={add}>
                        Import teams
                    </div>
                    <div className="button green strong big wide" onClick={add}>
                        {t('tournaments.create')}
                    </div>
                </div>
            </>
        )
    }


    return content();
};

export default Tournamentss;
