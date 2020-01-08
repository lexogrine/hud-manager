import React from 'react';
import './switch.css';

interface IProps {
    id: string;
    isOn: boolean,
    handleToggle?: (e?: any) => void;
}

class Switch extends React.PureComponent<IProps> {
    render() {
        return <>
            <input
                checked={this.props.isOn}
                onChange={this.props.handleToggle}
                className="react-switch-checkbox"
                id={this.props.id}
                type="checkbox"
            />
            <label
                style={{ background: (this.props.isOn && '#6b1cff') || 'black' }}
                className="react-switch-label"
                htmlFor={this.props.id}
            >
                <span className={`react-switch-button`} />
            </label>
        </>
    }
}


export default Switch;