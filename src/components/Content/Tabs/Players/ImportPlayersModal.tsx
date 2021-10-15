import { useTranslation } from 'react-i18next';
import api from './../../../../api/api';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';

interface Props {
    open: boolean;
    toggle: () => void;
}

const ImportPlayerModal = ({ open, toggle }: Props) => {

    const importSheet = (sheet: string) => {
        try {
            api.players.import(sheet).then((res: any) => {
                if(res.message){
                    toggle();
                }
            });
        } catch {

        }
    }

    const fileHandler = (files: FileList) => {
        if (!files) return;
        const file = files[0];
        if (!file) {
            return;
        }
        const reader: any = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            importSheet(reader.result)
        };
    };

    const uploadHandler = (e: any) => {
        if (!e.target.files) return;
        fileHandler(e.target.files);
    };

    const { t } = useTranslation();

    return (
        <Modal isOpen={open} toggle={toggle} className="veto_modal">
            <ModalHeader toggle={toggle}>Import Players</ModalHeader>
            <ModalBody>
                <div className="import-instruction">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
            </ModalBody>
            <ModalFooter className="no-padding">
                <div className="button wide green strong empty" onClick={toggle}>
                    {t('common.cancel')}
                </div>
                <input
                    type="file"
                    id={"import_players"}
                    accept={".xlsx"}
                    onChange={uploadHandler}
                    style={{display:'none'}}
                />
                <label className="centered" htmlFor={"import_players"}>
                    <div className="button wide green strong">
                        {t('common.import')}
                    </div>
                </label>
            </ModalFooter>
        </Modal>
    );
};

export default ImportPlayerModal;
