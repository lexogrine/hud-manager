import React, { Component } from 'react';
import { Row, Col, UncontrolledCollapse } from 'reactstrap';
import Config from './../../../../api/config';
import Tip from './../../../Tooltip';
import api from './../../../../api/api';
import * as I from './../../../../api/interfaces';
import HyperLink from './../../../../styles/Hyperlink.png';
import trash from './../../../../styles/trash.svg';
import Settings from './../../../../styles/Settings.png';
import Display from './../../../../styles/Display.png';
import Switch from './../../../../components/Switch/Switch';
import Map from './../../../../styles/Map.png';
import Killfeed from './../../../../styles/Killfeed.png';
import { socket } from '../Live/Live';
import RemoveHUDModal from './RemoveModal';
import { hashCode } from '../../../../hash';

interface IProps {
	hud: I.HUD;
	isActive: boolean;
	toggleConfig: (hud: I.HUD) => any;
}

interface IState {
	isOpen: boolean;
}
export default class HudEntry extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = {
			isOpen: false
		};
	}
	toggleModal = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};
	startHUD(dir: string) {
		api.huds.start(dir);
	}
	setHUD = (url: string) => {
		socket.emit('set_active_hlae', url);
	};
	delete = async () => {
		try {
			await api.huds.delete(this.props.hud.dir);
		} catch {}
		this.toggleModal();
	};
	copy = (hud: I.HUD) => {
		navigator.permissions
			.query({ name: 'clipboard-write' as PermissionName })
			.then(result => {
				if (result.state == 'granted' || result.state == 'prompt') {
					navigator.clipboard.writeText(hud.url);
				}
			})
			.catch();
	};
	render() {
		const { hud, toggleConfig, isActive } = this.props;
		return (
			<Row key={hud.dir} className="hudRow">
				<RemoveHUDModal isOpen={this.state.isOpen} toggle={this.toggleModal} hud={hud} remove={this.delete} />
				<Col s={12}>
					<Row>
						<Col className="centered thumb">
							<img
								src={`${Config.isDev ? Config.apiAddress : '/'}huds/${hud.dir}/thumbnail`}
								alt={`${hud.name}`}
							/>
						</Col>
						<Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
							<Row>
								<Col>
									<strong className="hudName">
										{hud.isDev ? '[DEV] ' : ''}
										{hud.name}
									</strong>{' '}
									<span className="hudVersion">({hud.version})</span>
								</Col>
							</Row>
							<Row>
								<Col className="hudAuthor">
									<div>{hud.author}</div>
								</Col>
							</Row>
							{hud.killfeed || hud.radar ? (
								<Row>
									<Col>
										{hud.radar ? (
											<Tip
												id={`radar_support_${hud.dir}`}
												className="radar_support"
												label={
													<img src={Map} className="action" alt="Supports boltgolt's radar" />
												}
											>
												Includes Boltgolt&apos;s radar
											</Tip>
										) : (
											''
										)}
										{hud.killfeed ? (
											<Tip
												id={`killfeed_support_${hud.dir}`}
												className="killfeed_support"
												label={
													<img
														src={Killfeed}
														className="action"
														alt="Supports custom killfeed"
													/>
												}
											>
												Includes custom killfeed
											</Tip>
										) : (
											''
										)}
									</Col>
								</Row>
							) : (
								''
							)}
						</Col>
						<Col style={{ flex: 1 }} className="hud-options">
							<div className="centered">
								<img
									src={HyperLink}
									id={`hud_link_${hashCode(hud.dir)}`}
									className="action"
									alt="Local network HUD URL"
								/>
								{hud.panel ? (
									<img
										src={Settings}
										onClick={toggleConfig(hud)}
										className="action"
										alt="HUD panel"
									/>
								) : (
									''
								)}
								{Config.isElectron ? (
									<img
										src={Display}
										onClick={() => this.startHUD(hud.dir)}
										className="action"
										alt="Start HUD"
									/>
								) : null}
								{Config.isElectron && !hud.isDev ? (
									<img src={trash} onClick={this.toggleModal} className="action" alt="Delete HUD" />
								) : null}
							</div>
							{Config.isElectron ? (
								<div className="hud-toggle">
									<Switch
										id={`hud-switch-${hud.dir}`}
										isOn={isActive}
										handleToggle={() => this.setHUD(hud.url)}
									/>
								</div>
							) : null}
						</Col>
					</Row>
					<Row>
						<Col s={12}>
							<div className="match_data">
								<UncontrolledCollapse toggler={`#hud_link_${hashCode(hud.dir)}`}>
									<code
										onClick={() => {
											navigator.clipboard.writeText(hud.url);
										}}
									>
										{hud.url}
									</code>
								</UncontrolledCollapse>
							</div>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	}
}
