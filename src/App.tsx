import React from 'react';
import Layout from './layout/Layout';
import './styles/styles.css';
import './styles/dark-mode.css';
import { socket } from './components/Content/Tabs/Live/Live';
interface IState {
    hudURL: string | null,
}
export default class App extends React.Component<any, IState> {
    constructor(props: any){
        super(props);
        this.state = {
            hudURL: null,
        }
    }
    componentDidMount(){
        socket.on("active_hlae", (url: string) => {
            this.setState({hudURL: url});
        });
        const url = new URL(window.location.href);
        const isHLAEGUI = url.searchParams.get("hlaegui");
        if(isHLAEGUI !== null) document.body.classList.add("hlaegui");
    }
    render() {
        const url = new URL(window.location.href);
        const isHLAEGUI = url.searchParams.get("hlaegui");

        if(isHLAEGUI === null) return (
            <Layout></Layout>
        )
        if(!this.state.hudURL) return null;
        return <iframe src={this.state.hudURL} style={{border:'none',width:'100vw',height:'100%', overflow:'hidden'}}></iframe>
    }
}
