import React from 'react';
import {
	Modal,
	ModalHeader,
	ModalBody,
	Row,
	Col,
	FormGroup,
	Input,
	/*FormText,*/ Button,
	ModalFooter
} from 'reactstrap';
import uuidv4 from 'uuid/v4';
import * as I from '../../api/interfaces';

interface Props {
	open: boolean;
	toggle: () => void;
	setForm: (value: React.SetStateAction<I.CustomFieldEntry[]>) => void;
	fields: I.CustomFieldEntry[];
	save: () => void;
}

const CustomFieldRow = ({
	field,
	onChange
}: {
	field: I.CustomFieldEntry;
	onChange: (type: 'name' | 'type') => (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
	<Row key={field._id}>
		<Col md="6">
			<FormGroup>
				<Input
					type="text"
					name={field._id}
					value={field.name}
					onChange={onChange('name')}
					placeholder="Field's name"
				/>
			</FormGroup>
		</Col>
		<Col md="6">
			<FormGroup>
				<Input type="select" name={field._id} value={field.type} onChange={onChange('type')}>
					<option value="" disabled>Input type</option>
					<option value="text">Text</option>
					<option value="team">Team</option>
					<option value="image">Image</option>
					<option value="match">Match</option>
					<option value="player">Player</option>
					<option value="color">Color</option>
				</Input>
			</FormGroup>
		</Col>
	</Row>
);

const CustomFieldsModal = ({ open, toggle, setForm, fields, save }: Props) => {
	const onChange = (type: 'name' | 'type') => (event: React.ChangeEvent<HTMLInputElement>) => {
		event.persist();
		const id = event.target.name;
		const newFields = fields
			.map(field => {
				if (field._id !== id) return field;
				field[type] = event.target.value.replace(/[^a-zA-Z_]/g, '') as any;
				return field;
			})
			.filter(field => field.name);
		setForm(newFields);
	};
	const addNewField = () => {
		const newField: I.CustomFieldEntry = {
			_id: uuidv4(),
			name: '',
			type: 'text'
		};
		setForm([...fields, newField]);
	};
	return (
		<Modal isOpen={open} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Manage Custom Fields</ModalHeader>
			<ModalBody>
				{fields.map(field => (
					<CustomFieldRow key={field._id} field={field} onChange={onChange} />
				))}
				{!fields.filter(field => !field.name).length ? (
					<Row className="centered">
						<Button className="purple-btn round-btn" onClick={addNewField}>
							Add new field
						</Button>
					</Row>
				) : null}
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={save}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CustomFieldsModal;
