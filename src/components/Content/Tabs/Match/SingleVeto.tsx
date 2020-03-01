import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import VetoModal from './VetoModal'

interface Props {
    map: number,
    veto: I.Veto,
    teams: I.Team[],
    match: I.Match,
    onSave: (name: string, map: number) => void,
    maps: string[]
}

function generateDescription(veto: I.Veto, team?: I.Team, secTeam?: I.Team) {
    if(!veto.mapName){
        return "";
    }
    if (veto.type === "decider") {
        return `${veto.mapName} decider`
    }
    if (!team || !team.name) {
        return "";
    }
    let text = `${team.name} ${veto.type}s ${veto.mapName}`;
    if (secTeam && secTeam.name && veto.side !== "NO") {
        text += `, ${secTeam.name} chooses ${veto.side} side`;
    }
    return text;
}

class SingleVeto extends React.Component<Props> {
    state = {
        isOpen: false
    }
    toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
    componentDidMount() {

    }
    render() {
        const team = this.props.teams.filter(team => team._id === this.props.veto.teamId)[0];
        const secTeam = this.props.teams.filter(team => team._id !== this.props.veto.teamId)[0];
        return (
            <div className={`veto-container ${this.props.veto.teamId === "" ? "empty" : ""} ${this.props.veto.teamId ? this.props.veto.type : ""}`}>
                {
                    this.props.teams.length !== 2 ? "Pick both teams to set vetos" :
                        <>
                            <div className="veto-main">
                                <div className="veto-title">VETO {this.props.map + 1}:</div>
                                <div className="veto-summary">{generateDescription(this.props.veto, team, secTeam)}</div>
                                <Button onClick={this.toggle} className="edit-veto purple-btn">Edit</Button>
                            </div>
                            {/* <div className="veto-desc">
                                    { score ? <div className="score-container">
                                        <div className={`left-team`}>
                                        <span className="team-name"><TeamLogoName team={team}/></span>
                                            <span className="score">{(match.left.id && score[match.left.id]) || 0}</span>
                                        </div>
                                        <div style={{width:'20px', flex:'unset', display: 'flex', alignItems:'center', justifyContent:'center'}}>:</div>
                                        <div className={`right-team`}>
                                            <span className="score">{(match.right.id && score[match.right.id]) || 0}</span>
                                            <span className="team-name"><TeamLogoName team={secTeam} reversed/></span>
                                        </div>
                                    </div> : ''}
                                </div>*/}

                            <VetoModal maps={this.props.maps} map={this.props.map} veto={this.props.veto} teams={this.props.teams} isOpen={this.state.isOpen} toggle={this.toggle} onChange={this.props.onSave} />
                        </>
                }

            </div>
        );
    }
}

export default SingleVeto;