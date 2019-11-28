import React, { SyntheticEvent } from 'react';
import DragIcon from './../styles/DragFile.svg';

type Event = "dragenter" | "dragover" | "dragleave" | "drop";
const events: Event[] = ["dragenter", "dragover", "dragleave", "drop"];

export default class DragFileInput extends React.Component<{onChange:(files: FileList)=>void, id:string}, {highlight: boolean}> {
    constructor(props: {onChange:(files: FileList)=>void, id:string}) {
        super(props);
        this.state = {
            highlight: false
        }
    }

    uploadHandler = (e: any) => {
        if(e.target.files) this.props.onChange(e.target.files);
    }

    prevent = (evt: DragEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        let highlight = false;
        if(evt.type === "dragenter" || evt.type === "dragover"){
            highlight = true;
        }
        if(this.state.highlight !== highlight){
            this.setState({ highlight })
        }
        if(evt.type === "drop" && evt.dataTransfer){
            this.props.onChange(evt.dataTransfer.files);
        }
        
    }

    componentDidMount = async () => {
        const area = document.getElementById(this.props.id);
        if(!area) return;
        events.forEach(eventName => {
            area.addEventListener(eventName, this.prevent, false);
            /*if(eventName === "dragenter" || eventName === "dragover"){
                this.setState({highlight: true});
            }*/
        });
        
    }


    render() {
        return (
            <div className={`dropArea ${this.state.highlight ? 'hightlight':''}`} id={`area_${this.props.id}`}>
                
                <input type="file" id={this.props.id} accept="image/*" onChange={this.uploadHandler} />
                <label className="centered" htmlFor={this.props.id} ><img src={DragIcon}/></label>
            </div>
        )
    }
}
