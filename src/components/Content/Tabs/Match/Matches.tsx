import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Form, Row, UncontrolledCollapse, Button, Card, CardBody } from 'reactstrap';
import Match from './Match';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

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
            <div className="match_row">
                <p>{match.current ? 'THIS IS LIVE' : ''}</p>
                <div className="main_data">
                    <div className="left team">
                        <div className="score">{match.left.wins}</div>
                        <div className="name">{left && left.name || "Team One"}</div>
                    </div>
                    <div className="versus">VS</div>
                    <div className="right team">
                        <div className="score">{match.right.wins}</div>
                        <div className="name">{right && right.name || "Team Two"}</div>
                    </div>
                </div>
                <div className="vetos"></div>
                <div className="options">
                    <Button color="primary" id={`match_id_${this.props.match.id}`}>Edit</Button>
                    <Button color="primary" onClick={ () => this.props.setCurrent()}>Set as current</Button>
                    <Button color="secondary" onClick={this.delete}>Delete</Button>
                </div>
                <div className="match_data">
                    <UncontrolledCollapse toggler={`#match_id_${this.props.match.id}`}>
                        <Card>
                            <CardBody>
                                <Match match={this.props.match} cxt={this.props.cxt} edit={this.props.edit}/>
                            </CardBody>
                        </Card>
                    </UncontrolledCollapse>
                </div>
            </div>
        )
    }
}

export default class Matches extends Component<{ cxt: IContextData }> {
    constructor(props: { cxt: IContextData }) {
        super(props);
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

    }

    render() {
        return (
            <Row className="matches_container">
                <Button onClick={this.add} color="primary" id="add_match_button" >Add match</Button>
                {this.props.cxt.matches.map(match => <MatchRow key={match.id} edit={this.edit} setCurrent={this.setCurrent(match.id)} match={match} teams={this.props.cxt.teams} cxt={this.props.cxt} />)}
            </Row>
        )
    }
}
