import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap';
import api from '../api/api';
import { Customer } from '../../types/interfaces';
interface IProps {
	version: string;
	customer?: Customer;
}

const Changelog = ({ version, customer }: IProps) => {
	const [changelog, setChangelog] = useState<any | null>(null);
	const [isVisible, setVisible] = useState(false);

	useEffect(() => {
		api.config.getLastVersion().then(async res => {
			if (res.version === version) return;

			const releaseInfo = await fetch(
				`https://api.github.com/repos/lexogrine/hud-manager/releases/tags/v${version}`
			)
				.then(res => res.json())
				.catch(() => null);

			if (!releaseInfo?.body) return;

			setChangelog(releaseInfo);
			setVisible(true);
		});
	}, []);

	const closeModal = () => {
		if (changelog) {
			api.config.setLastVersion(changelog.name, changelog.published_at);
		}
		setVisible(false);
	};

	return (
		<Modal isOpen={isVisible && !!customer} toggle={() => {}} className="veto_modal">
			<ModalHeader>Changelog v{version}</ModalHeader>
			<ModalBody>
				{changelog?.body.split(`\n`).map((entry: string) => (
					<div key={entry}>{entry}</div>
				))}
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={closeModal}>
					OK
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default Changelog;
