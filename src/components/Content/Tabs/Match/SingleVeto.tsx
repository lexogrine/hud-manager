import React from 'react';
import { Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import VetoModal from './VetoModal'

interface Props {
    map: number,
    veto: I.Veto,
    vetoTeams: I.Team[],
    match: I.Match,
    onSave: (name: string, map: number) => any,
    maps: string[]
}

function generateDescription(veto: I.Veto, team?: I.Team, secTeam?: I.Team) {
    if(!veto.mapName){
        return "";
    }
    if (veto.type === "decider") {
        return `${veto.mapName} decider`
    }
    if (!team || !team.name || !secTeam) {
        return <strong>Wrong team selected</strong>;
    }
    let text = `${team.name} ${veto.type}s ${veto.mapName}`;
    if (secTeam && secTeam.name && veto.side !== "NO") {
        text += `, ${secTeam.name} chooses ${veto.side} side`;
    }
    if(veto.score && Number.isInteger(veto.score[team._id]) && Number.isInteger(veto.score[secTeam._id])){
        text += ` (${team.shortName} ${veto.score[team._id]}:${veto.score[secTeam._id]} ${secTeam.shortName})`;
    }

    if(veto.mapEnd && veto.winner){
        if(team && team._id === veto.winner) {
            text += ` - ${team.name} wins`;
        } else if (secTeam && secTeam._id === veto.winner){
            text += ` - ${secTeam.name} wins`;
        }
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
    resetScore = () => {
        this.props.onSave("winner", this.props.map)({target:{value:undefined}});
        this.props.onSave("mapEnd", this.props.map)({target:{value:false}});
        this.props.onSave("score", this.props.map)({target:{value:{}}});
    }
    componentDidMount() {

    }
    render() {
        const { vetoTeams, veto, map, maps, onSave } = this.props;
        const team = vetoTeams.filter(team => team._id === veto.teamId)[0];
        const secTeam = vetoTeams.filter(team => team._id !== veto.teamId)[0];
        return (
            <div className={`veto-container ${veto.teamId === "" ? "empty" : ""} ${veto.teamId ? veto.type : ""}`}>
                {
                    (vetoTeams.length !== 2) ? "Pick both teams to set vetos" :
                        <>
                            <div className="veto-main">
                                <div className="veto-title">VETO {map + 1}:</div>
                                <div className="veto-summary">{generateDescription(veto, team, secTeam)}</div>
                                <Button onClick={this.resetScore} className="edit-veto purple-btn">Reset score</Button>
                                <Button onClick={this.toggle} className="edit-veto purple-btn">Edit</Button>
                            </div>

                            <VetoModal maps={maps} map={map} veto={veto} teams={vetoTeams} isOpen={this.state.isOpen} toggle={this.toggle} onChange={onSave} />
                        </>
                }

            </div>
        );
    }
}

export default SingleVeto;