import React from 'react';
import DragIcon from './../styles/upload.png';

interface IProps {
    onChange:(files: FileList)=>void,
    id:string,
    label: string,
    image?: boolean,
    className?: string,
    imgSrc?: string,
    accept?: string
}
interface IState {
    highlight: boolean
}

export default class DragFileInput extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            highlight: false
        }
    }
    allow = (e: any) => {  
        e.preventDefault();
        e.stopPropagation();
    }
    whileOver = (evt: React.DragEvent<HTMLDivElement>) => {
        let highlight = false;
        if(evt.type === "dragenter" || evt.type === "dragover"){
            highlight = true;
        }
        if(this.state.highlight !== highlight){
            this.setState({ highlight })
        }
    }
    drop = (evt: React.DragEvent<HTMLDivElement>) => {
        if(evt.dataTransfer)
            this.props.onChange(evt.dataTransfer.files);
        
        this.setState({highlight: false});
    }
    uploadHandler = (e: any) => {
        if(e.target.files) this.props.onChange(e.target.files);
    }

    render() {
        let accept = '';
        if(this.props.image){
            accept = "image/*";
        
        }
        if(this.props.accept){
            if(accept){
                accept += ",";
            }
            accept += this.props.accept;
        }
        return (
            <div className={`dropArea ${this.state.highlight ? 'hightlight':''} ${this.props.className || ''}`}
                id={`area_${this.props.id}`}
                onDragOver={this.allow}
                onDragEnter={this.whileOver}
                onDragOverCapture={this.whileOver}
                onDrop={this.drop}
                onDragEnd={this.whileOver}
                onDragLeave={this.whileOver}
            >
                
                <input type="file" id={this.props.id} accept={accept} onChange={this.uploadHandler} />
                <label className="centered" htmlFor={this.props.id} ><img src={DragIcon} alt="Drag file here"/>{this.props.label}</label>
                { this.props.imgSrc ? <img src={this.props.imgSrc} className="drag-file-img-preview" alt={'Preview'} /> : ''}
                <div className="background" />
            </div>
        )
    }
}
