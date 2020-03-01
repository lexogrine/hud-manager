import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, Button, Col } from 'reactstrap';
//import Match from './Match';
import MatchEdit from './EditMatch';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

import goBack from "./../../../../styles/goBack.png";

class MatchRow extends Component<{ match: I.Match, teams: I.Team[], cxt: IContextData, edit: Function, setCurrent: Function }> {
    delete = async () => {
        const matches = this.props.cxt.matches.filter(match => match.id !== this.props.match.id);
        await api.match.set(matches);
        this.props.cxt.reload();
    }
    render() {
        const { match, teams } = this.props;
        const left = teams.filter(team => team._id === match.left.id)[0];
        const right = teams.filter(team => team._id === match.right.id)[0];
        return (
            <div className={`match_row ${match.current ? 'live':''}`}>
                <div className="live-indicator">
                    Live
                </div>
                <div className="main_data">
                    <div className="left team">
                        <div className="score">
                            {match.left.wins}
                            {left && left.logo ? <img src={`data:image/jpeg;base64,${left.logo}`} alt={`${left.name}'s logo`} /> : ''}
                        </div>
                        <div className="name">{(left && left.name) || "Team One"}</div>
                    </div>
                    <div className="versus">VS</div>
                    <div className="right team">
                        <div className="score">
                            {match.right.wins}
                            {right && right.logo ? <img src={`data:image/jpeg;base64,${right.logo}`} alt={`${right.name}'s logo`} /> : ''}
                        </div>
                        <div className="name">{(right && right.name) || "Team Two"}</div>
                    </div>
                </div>
                <div className="vetos"></div>
                <div className="options">
                    <Button className="round-btn " onClick={this.delete}>Delete</Button>
                    <Button className="round-btn lightblue-btn" id={`match_id_${this.props.match.id}`} onClick={() => this.props.edit(this.props.match)}>Edit</Button>
                    <Button className="purple-btn round-btn" onClick={ () => this.props.setCurrent()}>Set as current</Button>
                </div>
                {/*<div className="match_data">
                    <UncontrolledCollapse toggler={`#match_id_${this.props.match.id}`}>
                        <Card>
                            <CardBody>
                                <Match match={this.props.match} cxt={this.props.cxt} edit={this.props.edit}/>
                            </CardBody>
                        </Card>
                    </UncontrolledCollapse>
                </div>*/}
            </div>
        )
    }
}

export default class Matches extends Component<{ cxt: IContextData }, { match: I.Match | null, maps: string[] }> {
    constructor(props: {cxt: IContextData}){
        super(props);
        this.state = {
            match: null,
            maps: []
        }
    }
    add = async () => {
        const { matches } = this.props.cxt;
        const newMatch: I.Match = {
            id: uuidv4(),
            current: false,
            left: { id: null, wins: 0 },
            right: { id: null, wins: 0 },
            matchType: 'bo1',
            vetos: []
        }
        
        for(let i = 0; i < 7; i++){
            newMatch.vetos.push({teamId: '', mapName: '', side: 'NO', type:'pick', mapEnd: false, reverseSide:false});
            
        }
        matches.push(newMatch);
        await api.match.set(matches);
        this.props.cxt.reload();
    }

    edit = async (id: string, match: I.Match) => {
        const { matches } = this.props.cxt;
        const newMatches = matches.map(oldMatch => {
            if(oldMatch.id !== id) return oldMatch;
            return match;
        })
        await api.match.set(newMatches);
        this.props.cxt.reload();
        
    }

    startEdit = (match?: I.Match) => {
        this.setState({match: match || null});
    }

    setCurrent = (id: string) => async () => {
        const { matches } = this.props.cxt;
        const newMatches = matches.map(match => {
            match.current = match.id === id;
            return match;
        });
        await api.match.set(newMatches);
        this.props.cxt.reload();

    }

    async componentDidMount() {
        await this.props.cxt.reload();
        const maps = await api.match.getMaps();
        this.setState({maps});

    }

    render() {
        const { match, maps } = this.state;
        return (
            <React.Fragment>
                { match ?
                    <div className="tab-title-container">
                        <img src={goBack}  onClick={() => this.startEdit()} className="go-back-button" alt="Go back"/>Edit match
                    </div> :
                    <div className="tab-title-container">Matches</div>
                }
                <div className="tab-content-container no-padding">
                    {match ? <MatchEdit match={match} edit={this.edit} teams={this.props.cxt.teams} cxt={this.props.cxt} maps={maps}  /> :
                    <>
                        <Row className="matches_container">
                            {this.props.cxt.matches.map(match => <MatchRow key={match.id} edit={this.startEdit} setCurrent={this.setCurrent(match.id)} match={match} teams={this.props.cxt.teams} cxt={this.props.cxt} />)}
                        </Row>
                        <Row>
                            <Col className="main-buttons-container">
                                <Button onClick={this.add} color="primary">+Create New</Button>
                            </Col>
                        </Row>
                    </>}
                </div>
            </React.Fragment>
        )
    }
}
