import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useTranslation } from 'react-i18next';

interface Props {
	title: string;
	content: string;
	toggle: () => void;
	confirmDelete: () => void;
    isOpen: boolean;
}

const DeleteModal = ({ title, content, toggle, confirmDelete, isOpen }: Props) => {
	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} toggle={toggle} className="veto_modal">
			<ModalHeader toggle={toggle}>{title}</ModalHeader>
			<ModalBody>
				<div className="">{content}</div>
			</ModalBody>
			<ModalFooter className="no-padding">
				<div className="button wide green strong empty" onClick={toggle}>
					{t('common.cancel')}
				</div>
				<div className="button wide green strong" onClick={confirmDelete}>
					{t('common.delete')}
				</div>
			</ModalFooter>
		</Modal>
	);
};

export default DeleteModal;
