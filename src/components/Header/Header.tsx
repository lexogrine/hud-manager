import React from 'react';
import logoWhite from './../../styles/logo-white.png';

export default class Header extends React.Component {
    render() {
        return (
            <div className="py-5 text-center main-header">
                <img src={logoWhite} height="80px" /><h2>HUD Manager</h2>
            </div>
        )
    }
}
