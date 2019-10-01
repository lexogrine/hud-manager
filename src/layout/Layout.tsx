import React from 'react';

import Header from '../components/Header/Header';
import Content from "../components/Content/Content";

export default class Layout extends React.Component {
    render() {
        return (
            <>
                <Header/>
                <Content/>
            </>
        )
    }
}
