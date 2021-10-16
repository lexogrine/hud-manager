import { useState } from "react";

const Checkbox = ({ checked, onChange }: { checked?: boolean, onChange?: () => void }) => {
    const [ innerState, setInnerState ] = useState(false);

    const state = checked === undefined ? innerState : checked;

    const onClick = () => {
        if(onChange){
            onChange();
        } else {
            setInnerState(!state);
        }
    }

    return (
        <div className={`delete-checkbox ${state ? 'active' : ''}`} onClick={onClick}>{state ? '✓':null}</div>
    )
    
}

export default Checkbox;