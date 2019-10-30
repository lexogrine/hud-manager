import React from 'react';
import { Tooltip } from 'reactstrap';

export default class Tip extends React.Component<{label: string}> {
    state = {
        isOpen: false
    }
    toggle = () => {
        this.setState({isOpen:!this.state.isOpen})
    }
    render(){
        const id = this.props.label.replace(/ /g,"_").toUpperCase();
        return <>
        <span id={id} onMouseOver={this.toggle}>{this.props.label}</span>
        <Tooltip placement="top" target={id} isOpen={this.state.isOpen} toggle={this.toggle}>
            {this.props.children}
        </Tooltip>
        </>
    }
}