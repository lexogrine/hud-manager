import React from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col, CustomInput } from 'reactstrap';
import countryList from 'react-select-country-list';

export default class Teams extends React.Component<{}, {options: any[], value: string}> {
    constructor(props: {}) {
        super(props);

        this.state = {
            options: countryList().getData(),
            value: "",
        };
    }

    changeHandler = (value: any) => {
        console.log(value);
        //this.setState({ value })
    }

    render() {
        return (
            <Form>
                <FormGroup>
                    <Label for="teams">Teams already exists</Label>
                    <Input type="select" name="teams" id="teams">
                    </Input>
                </FormGroup>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="team_name">Team name</Label>
                            <Input type="text" name="team_name" id="team_name" />
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label for="short_name">Short name</Label>
                            <Input type="text" name="short_name" id="short_name" />
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col md="6">
                        <FormGroup>
                            <Label for="team_flag">Country</Label>
                            <CustomInput
                                type="select"
                                id="team_flag"
                                name="team_flag"
                                value={this.state.value}
                                onChange={this.changeHandler}
                            >
                                {this.state.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </CustomInput>
                        </FormGroup>
                    </Col>
                    <Col md="6">
                        <FormGroup>
                            <Label for="team_logo">Logo</Label>
                            <Input type="file" name="team_logo" id="team_logo" />
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
