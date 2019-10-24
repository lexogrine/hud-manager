import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import * as I from './../../../../api/interfaces';
import VetoModal from './VetoModal'
interface Props {
    map: number,
    veto: I.Veto,
    teams: I.Team[],
    onSave: (name: string, map: number) => void;
}

class TeamLogoName extends React.Component<{team: I.Team, reversed?: boolean}>{
    render(){
        if(this.props.reversed){
            return <span>
                <strong>{this.props.team.name}</strong>
                {this.props.team.logo ? <img src={`data:image/jpeg;base64,${this.props.team.logo}`} /> : ''}
            </span>
        }
        return <span>
            {this.props.team.logo ?
                <img src={`data:image/jpeg;base64,${this.props.team.logo}`} /> : ''}
                <strong>{this.props.team.name}</strong>
            </span>
    }
}

class SingleVeto extends React.Component<Props> {
    state = {
        isOpen: false
    }
	setOnPress = (element: JSX.Element) => {
		return React.cloneElement(element, { onClick: this.toggle });
	}
	toggle = () => {
		this.setState({ isOpen: !this.state.isOpen });
	}
    render() {
        const team = this.props.teams.filter(team => team._id === this.props.veto.teamId)[0];
        const secTeam = this.props.teams.filter(team => team._id !== this.props.veto.teamId)[0];
        const score = this.props.veto.score;
        return (
                <Col md="12">
                    <div className={`veto-container ${this.props.veto.teamId === "" ? "empty":""} ${this.props.veto.teamId ? this.props.veto.type : ""}`}>
                        {
                            this.props.teams.length !== 2 ? "Pick both teams to set vetos" : 
                            <>
                                <div className="veto-title">VETO #{this.props.map+1}</div>
                                <div className="veto-desc">
                                    <div>
                                        { team && team.name && this.props.veto.mapName ?
                                            <>
                                                <TeamLogoName team={team}/> {this.props.veto.type}s  <strong>{this.props.veto.mapName}</strong>
                                            </>
                                        
                                        : ''}
                                        { team && team.name && !this.props.veto.mapName ? 'Choose a map' : '' }
                                        {this.props.veto.mapName && team && team.name && secTeam && secTeam.name && this.props.veto.side !== "NO" ?
                                            <>
                                                , <TeamLogoName team={secTeam}/> picks {this.props.veto.side} side
                                            </>
                                            
                                        : '' }
                                    </div>
                                    { score ? <div className="score-container">
                                        <div className={`left-team ${score.winner.orientation === "left" ? "winner" : "loser"}`}>
                                        <span className="team-name"><TeamLogoName team={team}/></span>
                                            <span className="score">{score.winner.orientation === "left" ? score.winner.score+1 : score.loser.score}</span>
                                        </div>
                                        <div style={{width:'20px', flex:'unset', display: 'flex', alignItems:'center', justifyContent:'center'}}>:</div>
                                        <div className={`right-team ${score.winner.orientation === "right" ? "winner" : "loser"}`}>
                                            <span className="score">{score.winner.orientation === "right" ? score.winner.score+1 : score.loser.score}</span>
                                            <span className="team-name"><TeamLogoName team={secTeam} reversed/></span>
                                        </div>
                                    </div> : ''}
                                </div>
                                {this.setOnPress(<Button>Edit</Button>)}
                                <VetoModal map={this.props.map} veto={this.props.veto} teams={this.props.teams} isOpen={this.state.isOpen} toggle={this.toggle} onChange={this.props.onSave}/>
                            </>
                        }
                        
                    </div>
                </Col>
        );
    }
}

export default SingleVeto;