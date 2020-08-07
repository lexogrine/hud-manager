import React from 'react';
import { Tooltip } from 'reactstrap';

export default class Tip extends React.Component<{ id: string; className?: string; label: any; link?: string }> {
	state = {
		isOpen: false
	};
	toggle = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};
	render() {
		return (
			<>
				<span className={this.props.className || ''} id={this.props.id} onMouseOver={this.toggle}>
					{this.props.link ? (
						<a
							style={{ textDecoration: 'none', color: 'white' }}
							rel="noopener noreferrer"
							href={this.props.link}
							target="_blank"
						>
							{this.props.label}
						</a>
					) : (
						this.props.label
					)}
				</span>
				<Tooltip placement="top" target={this.props.id} isOpen={this.state.isOpen} toggle={this.toggle}>
					{this.props.children}
				</Tooltip>
			</>
		);
	}
}
