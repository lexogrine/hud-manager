import React, { Component } from 'react';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import { Row, UncontrolledCollapse, Button, Card, CardBody, Col } from 'reactstrap';
import Match from './Match';
import uuidv4 from 'uuid/v4';

import { IContextData } from '../../../Context';

export default class MatchEdit extends Component<{ match: I.Match, teams: I.Team[], cxt: IContextData, edit: Function, setCurrent: Function }> {
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
