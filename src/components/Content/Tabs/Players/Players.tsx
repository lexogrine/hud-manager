import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, CustomInput } from 'reactstrap';
import countryList from 'react-select-country-list';

export default class Players extends React.Component<{}, {options: any[], value: string}> {
    constructor(props: {}) {
        super(props);

        this.state = {
            options: countryList().getData(),
            value: "",
        };
    }

    changeHandler = (value: any) => {
        console.log(value);
       // this.setState({ value })
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="players">Players already exists</Label>
                    <Input type="select" name="players" id="players">
                    </Input>
                </FormGroup>
                <Row>
                    <Col md="4">
                        <FormGroup>
                            <Label for="first_name">First name</Label>
                            <Input type="text" name="first_name" id="first_name" />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="nick">Nick</Label>
                            <Input type="text" name="nick" id="nick" />
                        </FormGroup>
                    </Col>
                    <Col md="4">
                        <FormGroup>
                            <Label for="last_name">Last name</Label>
                            <Input type="text" name="last_name" id="last_name" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="player_flag">Country</Label>
                            <CustomInput
                                type="select"
                                id="player_flag"
                                name="player_flag"
                                value={this.state.value}
                                onChange={this.changeHandler}
                            >
                                {this.state.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </CustomInput>
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label for="player_team">Team</Label>
                            <CustomInput
                                type="select"
                                id="player_team"
                                name="player_team"
                            >
                            </CustomInput>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <FormGroup>
                            <Label for="steam_id">SteamID 64</Label>
                            <Input id="steam_id" type="text" name="steam_id" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button color="primary">Save</Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

