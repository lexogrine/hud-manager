import { Input, InputProps } from "reactstrap";
import "./index.scss";
const LabeledInput = ({ label, ...props }: InputProps & { label: string }) => (
    <div className="input-container">
        <div className="input-label-container">{label}</div>
        <Input {...props} />
    </div>
)

export default LabeledInput;