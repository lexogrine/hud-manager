import React from "react";
import logoWhite from "./../../styles/app_bar.png";

export default class Header extends React.Component {
  render() {
    return (
      <div className="py-5 text-center main-header">
        <img src={logoWhite} alt="logo white" height="80px" />
        <h2>HUD Manager</h2>
      </div>
    );
  }
}
