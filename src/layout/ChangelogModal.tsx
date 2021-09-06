import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap';
import api from '../api/api';
import { Customer } from '../../types/interfaces';
interface IProps {
	version: string;
	customer?: Customer;
}

interface ChangelogEntry {
	version: string;
	changelog: string[];
}

const Changelog = ({ version, customer }: IProps) => {
	const [changelog, setChangelog] = useState<ChangelogEntry[] | null>(null);
	const [isVisible, setVisible] = useState(false);
	const [ name, setName ] = useState('');
	const [ publishedAt, setPublishedAt ] = useState('');

	useEffect(() => {
		api.config.getLastVersion().then(async res => {
			if (res.version === version) return;

			const allReleases = await fetch('https://api.github.com/repos/lexogrine/hud-manager/releases').then(res => res.json()).catch(() => null) as any[];

			const indexOfLastVersion = allReleases.findIndex((release: any) => release.tag_name === `v${res.version}`);

			allReleases.splice(indexOfLastVersion);

			const existingReleases = allReleases.filter(release => release && release.body)
			const releases = existingReleases.map((release: any) => ({ version: release.name, changelog: release.body.split(`\n`) }));

			if (!releases.length) return;

			setChangelog(releases);
			setVisible(true);
			setName(existingReleases[0].name);
			setPublishedAt(existingReleases[0].published_at);
		});
	}, []);

	const closeModal = () => {
		if (name && publishedAt) {
			api.config.setLastVersion(name, publishedAt);
		}
		setVisible(false);
	};

	return (
		<Modal isOpen={isVisible && !!customer} toggle={() => {}} className="veto_modal">
			<ModalHeader>Changelog</ModalHeader>
			<ModalBody>
				{
					changelog?.map(changelogEntry => (
						<React.Fragment key={changelogEntry.version}>
							<strong>{changelogEntry.version}</strong>
							{
								changelogEntry.changelog.map(entry => (
									<div key={entry}>{entry}</div>
								))
							}
						</React.Fragment>
					))
				}
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
