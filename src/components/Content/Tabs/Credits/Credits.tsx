import React from 'react';
import { Row, Col } from 'reactstrap';

const CreditsEntry = ({ title, people }: { title: string; people: string[] }) => (
	<div className="credits_segment">
		<div className="credits_title">{title}</div>
		<div className="credits_name">{people.join(', ')}</div>
	</div>
);

const Credits = () => (
	<>
		<div className="tab-title-container">Credits</div>
		<div className="tab-content-container full-scroll">
			<Row>
				<Col>
					<CreditsEntry title="Application and HUD API" people={['osztenkurden']} />
					<CreditsEntry title="Testing and Debugging" people={['osztenkurden', 'Komodo', 'Loxar']} />
					<CreditsEntry title="Custom radar by" people={['boltgolt']} />
					<CreditsEntry title="Initial Layout Idea" people={['Drożdżu']} />
					<CreditsEntry
						title="Feedback & Ideas"
						people={['boltgolt', 'Komodo', 'TeDY', 'Wiethoofd', 'Laeye', 'Loxar']}
					/>
				</Col>
			</Row>
		</div>
	</>
);

export default Credits;
