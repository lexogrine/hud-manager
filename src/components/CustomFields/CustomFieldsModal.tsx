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

const CustomFieldRow = ({ field, onChange }: { field: I.CustomFieldEntry; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <Row key={field._id}>
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
    </Row>
);

const CustomFieldsModal = ({ open, toggle, setForm, fields, save }: Props) => {
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        const id = event.target.name;
        const newFields = fields.map(field => {
            if (field._id !== id) return field;
            field.name = event.target.value.replace(/[^a-zA-Z_]/g, '');
            return field;
        }).filter(field => field.name);
        setForm(newFields);
    };
    const addNewField = () => {
        const newField: I.CustomFieldEntry = {
            _id: uuidv4(),
            name: '',
            type: 'text'
        }
        setForm([...fields, newField]);
    }
    return (
        <Modal isOpen={open} toggle={toggle} className="veto_modal">
            <ModalHeader toggle={toggle}>Manage Custom Fields</ModalHeader>
            <ModalBody>
                {fields.map(field => (
                    <CustomFieldRow
                        key={field._id}
                        field={field}
                        onChange={onChange}
                    />
                ))}
                {
                    !fields.filter(field => !field.name).length ? (
                        <Row className="centered">
                            <Button className="purple-btn round-btn" onClick={addNewField}>
                            Add new field
						    </Button>
                        </Row>
                    ) : null
                }

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
