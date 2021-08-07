
import { Row, Col } from 'reactstrap';
import { useTranslation } from 'react-i18next';

const CreditsEntry = ({ title, people }: { title: string; people: string[] }) => (
	<div className="credits_segment">
		<div className="credits_title">{title}</div>
		<div className="credits_name">{people.join(', ')}</div>
	</div>
);

const Credits = () => {
	const { t } = useTranslation();

	return (
		<>
			<div className="tab-title-container">Credits</div>
			<div className="tab-content-container full-scroll">
				<Row>
					<Col>
						<CreditsEntry title={t('credits.applicationAndAPI')} people={['osztenkurden']} />
						<CreditsEntry
							title={t('credits.testingAndDebugging')}
							people={['osztenkurden', 'Komodo', 'Loxar']}
						/>
						<CreditsEntry title={t('credits.initialLayoutIdea')} people={['Drożdżu']} />
						<CreditsEntry
							title={t('credits.feedbackAndIdeas')}
							people={['boltgolt', 'Komodo', 'TeDY', 'Wiethoofd', 'Laeye', 'Loxar']}
						/>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default Credits;
