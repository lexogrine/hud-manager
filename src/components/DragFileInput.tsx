import { Component } from 'react';
import DragIcon from './../styles/upload.png';

interface Props {
	onChange: (files: FileList) => void;
	id: string;
	label: string;
	image?: boolean;
	className?: string;
	multiple?: boolean;
	imgSrc?: string | string[];
	accept?: string;
	removable?: boolean;
}
interface State {
	highlight: boolean;
}

export default class DragFileInput extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			highlight: false
		};
	}
	allow = (e: any) => {
		e.preventDefault();
		e.stopPropagation();
	};
	whileOver = (evt: React.DragEvent<HTMLDivElement>) => {
		let highlight = false;
		if (evt.type === 'dragenter' || evt.type === 'dragover') {
			highlight = true;
		}
		if (this.state.highlight !== highlight) {
			this.setState({ highlight });
		}
	};
	drop = (evt: React.DragEvent<HTMLDivElement>) => {
		if (evt.dataTransfer) {
			this.props.onChange(evt.dataTransfer.files);
		}

		this.setState({ highlight: false });
	};
	uploadHandler = (e: any) => {
		if (e.target.files) {
			this.props.onChange(e.target.files);
		}
	};

	clear = () => {
		this.props.onChange([] as unknown as FileList);
	};

	renderPreview = (imgSrc?: string | string[]) => {
		if (!imgSrc) return null;

		if (typeof imgSrc === 'string') return <img src={imgSrc} className="drag-file-img-preview" alt={'Preview'} />;

		return imgSrc.map(imgSrc => (
			<img key={imgSrc} src={imgSrc} className="drag-file-img-preview" alt={'Preview'} />
		));
	};

	render() {
		let accept = '';
		if (this.props.image) {
			accept = 'image/*';
		}
		if (this.props.accept) {
			if (accept) {
				accept += ',';
			}
			accept += this.props.accept;
		}
		return (
			<div
				className={`dropArea ${this.state.highlight ? 'hightlight' : ''} ${this.props.className || ''}`}
				id={`area_${this.props.id}`}
				onDragOver={this.allow}
				onDragEnter={this.whileOver}
				onDragOverCapture={this.whileOver}
				onDrop={this.drop}
				onDragEnd={this.whileOver}
				onDragLeave={this.whileOver}
			>
				{this.props.removable ? (
					<div className="removeButton" onClick={this.clear}>
						X
					</div>
				) : null}
				<input
					type="file"
					multiple={this.props.multiple}
					id={this.props.id}
					accept={accept}
					onChange={this.uploadHandler}
				/>
				<label className="centered" htmlFor={this.props.id}>
					<img src={DragIcon} alt="Drag file here" />
					{this.props.label}
				</label>
				{this.renderPreview(this.props.imgSrc)}
				<div className="background" />
			</div>
		);
	}
}
