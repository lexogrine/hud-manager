import React, { Component } from 'react';
import {Form, FormGroup, Col, Row, Label, CustomInput} from 'reactstrap';

export default class Match extends Component {
    render() {
        return (
            <Form>
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Label for="match_type">Match Type</Label>
                            <CustomInput
                                type="select"
                                id="match_type"
                                name="match_type"
                            >
                                <option value="bo1">BO1</option>
                                <option value="bo2">BO2</option>
                                <option value="bo3">BO3</option>
                                <option value="bo5">BO5</option>
                            </CustomInput>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <h4 className="text-center">Left team</h4>
                        <FormGroup>
                            <Label for="">Score</Label>
                            <CustomInput
                                type="select"
                                id="left_score"
                                name="left_score"
                            >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </CustomInput>
                        </FormGroup>
                        <FormGroup>
                            <Label for="left_team">Set team</Label>
                            <CustomInput
                                type="select"
                                id="left_team"
                                name="left_team"
                            >
                            </CustomInput>
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <h4 className="text-center">Right team</h4>
                        <FormGroup>
                            <Label for="">Score</Label>
                            <CustomInput
                                type="select"
                                id="right_score"
                                name="right_score"
                            >
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </CustomInput>
                        </FormGroup>
                        <FormGroup>
                            <Label for="right_team">Set team</Label>
                            <CustomInput
                                type="select"
                                id="right_team"
                                name="right_team"
                            >
                            </CustomInput>
                        </FormGroup>
                    </Col>
                </Row>
            </Form>
        )
    }
}
