import React from "react";
import { Row, Col } from "reactstrap";

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

export default class Credits extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="tab-title-container">Credits</div>
        <div className="tab-content-container full-scroll">
          <Row>
            <Col>
              <CreditsEntry title="Application and HUD API" people={["osztenkurden"]} />
              <CreditsEntry title="Testing and Debugging" people={["osztenkurden", "Komodo", "Loxar"]} />
              <CreditsEntry title="Custom radar by" people={["boltgolt"]} />
              <CreditsEntry title="Initial Layout Idea" people={["Drożdżu"]} />
              <CreditsEntry title="Feedback & Ideas" people={["boltgolt", "Komodo", "TeDY", "Wiethoofd", "Laeye", "Loxar"]} />
            </Col>
          </Row>
        </div>
      </React.Fragment>

    );
  }
}
