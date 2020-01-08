import React from "react";
import { Row, Col } from "reactstrap";

class CreditsEntry extends React.Component<{ title: string; people: string[] }> {
  render() {
    return (
      <div className="credits_segment">
        <h3>&#10023;{this.props.title}: </h3>
        <div>
          {this.props.people.map(man => (
            <p className="credits_name" key={man}>
              {man}
            </p>
          ))}
        </div>
      </div>
    );
  }
}

export default class Credits extends React.Component {
  render() {
    return (
      <Row>
        <Col>
          <CreditsEntry title="Application and HUD API" people={["osztenkurden"]} />
          <CreditsEntry title="HUD Design" people={["Komodo"]} />
          <CreditsEntry title="Testing and Debugging" people={["osztenkurden", "Komodo"]} />
          <CreditsEntry title="Radar Development" people={["boltgolt"]} />
          <CreditsEntry title="Manager Design" people={["Drożdżu"]} />
          <CreditsEntry title="Ideas" people={["boltgolt", "Komodo", "TeDY"]} />
        </Col>
      </Row>
    );
  }
}
