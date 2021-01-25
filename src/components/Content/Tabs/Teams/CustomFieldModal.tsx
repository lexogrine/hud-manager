import React from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Input, /*FormText,*/ Button, ModalFooter } from 'reactstrap';
import * as I from '../../../../api/interfaces';

interface Props {
	open: boolean;
	toggle: () => void;
	setForm: (value: React.SetStateAction<I.CustomFieldEntry[]>) => void;
	fields: I.CustomFieldEntry[];
}
/*
const CustomFieldRow = ({ field, onChange }: { field: I.CustomFieldEntry; onChange: any }) => (
	<FormGroup>
		<Col md="12">
			<FormGroup>
				<Input type={field.type} value={field.name} onChange={onChange} placeholder="Field's name" />
			</FormGroup>
		</Col>
	</FormGroup>
);*/

const CustomFieldModal = ({ open, toggle, setForm, fields }: Props) => {
	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.persist();
		const id = event.target.name;
		const newFields = fields.map(field => {
			if (field._id !== id) return field;
			field.name = event.target.value;
			return field;
		});
		setForm(newFields);
	};
	return (
		<Modal isOpen={open} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>Custom Team Fields</ModalHeader>
			<ModalBody>
				<Row className="centered">
					{fields.map(field => (
						<FormGroup key={field._id}>
							<Col md="12">
								<FormGroup>
									<Input
										type={field.type}
										name={field._id}
										value={field.name}
										onChange={onChange}
										placeholder="Field's name"
									/>
								</FormGroup>
							</Col>
						</FormGroup>
					))}
				</Row>
			</ModalBody>
			<ModalFooter className="no-padding">
				<Button color="primary" className="modal-save" onClick={() => {}}>
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default CustomFieldModal;
