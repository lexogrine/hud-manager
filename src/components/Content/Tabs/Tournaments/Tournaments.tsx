import React from 'react';
import { Button, Form, FormGroup, Input, Row, Col, FormText } from 'reactstrap';
import countryList from 'react-select-country-list';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { IContextData } from './../../../../components/Context';
import DragFileInput from './../../../DragFileInput';
import { TournamentMatchup } from '../../../../../types/interfaces';

const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0).toString();
const hash = () => hashCode(String((new Date()).getTime()));

interface MatchData {
    left: { name: string, score: string | number, logo: string },
    right: { name: string, score: string | number, logo: string },
}

export default class Teams extends React.Component<{ cxt: IContextData }, { tournament: I.Tournament | null }> {
    constructor(props: { cxt: IContextData }) {
        super(props);
        this.state = {
            tournament: null
        };
    }

    loadTeams = async (id?: string) => {
        await this.props.cxt.reload();
        if (id) {
            this.loadTournament(id);
        }
    }

    loadTournament = async (id: string) => {
        const tournament = this.props.cxt.tournaments.find(tournament => tournament._id === id);
        console.log(id);
        if (tournament) this.setState({ tournament });
    }

    setTournament = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === "empty") {
            return this.setState({ tournament: null });
        }
        this.loadTournament(event.target.value);
    }
    
    addTournament = (name: string, logo: string, type: string, teams: number) => {
        api.tournaments.add({ name, logo, teams, type });
        this.props.cxt.reload();
    }

    fileHandler = (files: FileList) => {


        if (!files || !files[0]) return;
        const file = files[0];
        //const { form } = this.state;
        if (!file.type.startsWith("image")) {
            return;
        }
        let reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            //form.logo = reader.result.replace(/^data:([a-z]+)\/([a-z0-9]+);base64,/, '');
            //this.setState({ form })
        }
    }

    /*changeHandler = (event: any) => {
        const name: 'name' | 'shortName' | 'logo' | 'country' = event.target.name;
        const { form }: any = this.state;
        if (!event.target.files) {
            form[name] = event.target.value;
            return this.setState({ form });
        }

        return this.fileHandler(event.target.files);

        // this.setState({ value })
    }*/
    delete = async () => {
        const { tournament } = this.state;
        if (!tournament || tournament._id === "empty") return;
        /*const response = await api.teams.delete(this.state.form._id);
        if (response) {
            await this.loadTeams();
            this.setState({ form: { ...this.emptyTeam } });
        }*/
    }

    joinParents = (matchup: TournamentMatchup) => {
        const { tournament } = this.state;
        if(!tournament || !matchup) return matchup;
        
        if(matchup.parents.length) return matchup;

        const parents = tournament.matchups.filter(m => m.winner_to === matchup._id || m.loser_to === matchup._id);
        if(!parents.length) return matchup;
        matchup.parents.push(...parents.map(this.joinParents));

        return matchup;
    }

    copyMatchups = (): TournamentMatchup[] => {
        if(!this.state.tournament) return [];
        return JSON.parse(JSON.stringify(this.state.tournament.matchups));
    }

    getMatch = (matchup: TournamentMatchup) => {
        const { cxt } = this.props;
        const matchData: MatchData = {
            left: { name: 'TBD', score: '-', logo: '' },
            right: { name: 'TBD', score: '-', logo: '' },
        };
        const match = cxt.matches.find(match => match.id === matchup.matchId);
        if(!match) return matchData;
        const teams = [cxt.teams.find(team => team._id === match.left.id), cxt.teams.find(team => team._id === match.right.id)];
        if(teams[0]){
            matchData.left.name = teams[0].name;
            matchData.left.score = match.left.wins;
            matchData.left.logo = teams[0].logo;
        }
        if(teams[1]){
            matchData.right.name = teams[1].name;
            matchData.right.score = match.right.wins;
            matchData.right.logo = teams[1].logo;
        }
        return matchData;
    }

    renderBracket = (matchup?: TournamentMatchup | null, isLast = false) => {
        if(!matchup) return null;
        const match = this.getMatch(matchup);
        return (
            <div className="bracket">
                <div className="parent-brackets">
                    {this.renderBracket(matchup.parents[0])}
                    {this.renderBracket(matchup.parents[1])}
                    { matchup.parents.length === 2 ? <div className="connector"></div> : null}
                </div>
                <div className="bracket-details">
                    <div className={`match-connector ${!matchup.parents.length ? 'first-match' : ''} ${isLast ? 'last-match' : ''}`}></div>
                    <div className="match-details">
                        <div className="team-data">
                            <div className="team-logo">{ match.left.logo ? <img src={match.left.logo} /> : null}</div>
                            <div className="team-name">{match.left.name}</div>
                            <div className="team-score">{match.left.score}</div>
                        </div>
                        <div className="team-data">
                            <div className="team-logo">{ match.right.logo ? <img src={match.right.logo} /> : null}</div>
                            <div className="team-name">{match.right.name}</div>
                            <div className="team-score">{match.right.score}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderLadder = () => {
        const { tournament } = this.state;
        if(!tournament) return null;
        const matchups = this.copyMatchups();
        const gf = matchups.find(matchup => matchup.winner_to === null);
        if(!gf) return null;
        return this.renderBracket(this.joinParents(gf), true);
    }

    render() {
        const { tournament } = this.state;
        return (
            <Form>
                <div className="tab-title-container">Tournaments</div>
                <div className="tab-content-container">
                    <Button onClick={() => this.addTournament("Test", "", "se", 8)}>Add test tournament</Button>
                    <FormGroup>
                        <Input type="select" name="tournaments" id="tournaments" onChange={this.setTournament} value={this.state.tournament?._id}>
                            <option>No tournament</option>
                            {this.props.cxt.tournaments.concat().sort((a, b) => a.name < b.name ? -1 : 1).map(tournament => <option key={tournament._id} value={tournament._id}>{tournament.name}</option>)}
                        </Input>
                    </FormGroup>
                    <div className="ladder-view" style={{height:'500px'}}>
                        {this.renderLadder()}
                    </div>
                </div>
            </Form>
        )
    }
}
