import React from 'react';
import { Row, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';

class CreditsEntry extends React.Component<{ title: string; people: string[] }> {
	render() {
		return (
			<div className="credits_segment">
				<div className="credits_title">{this.props.title}</div>
				<div className="credits_name">{this.props.people.join(', ')}</div>
			</div>
		);
	}
}

class Credits extends React.Component<{ t: any }> {
	render() {
		const t = this.props.t;
		return (
			<React.Fragment>
				<div className="tab-title-container">{t('credits.header')}</div>
				<div className="tab-content-container full-scroll">
					<Row>
						<Col>
							<CreditsEntry
								title={t('credits.applicationAndAPI')}
								people={['osztenkurden', 'kacperski1']}
							/>
							<CreditsEntry
								title={t('credits.testingAndDebugging')}
								people={['osztenkurden', 'Komodo', 'Loxar']}
							/>
							<CreditsEntry title={t('credits.customRadarBy')} people={['boltgolt']} />
							<CreditsEntry title={t('credits.initialLayoutIdea')} people={['Drożdżu']} />
							<CreditsEntry
								title={t('credits.feedbackAndIdeas')}
								people={['boltgolt', 'Komodo', 'TeDY', 'Wiethoofd', 'Laeye', 'Loxar']}
							/>
						</Col>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}

export default withTranslation()(Credits);
