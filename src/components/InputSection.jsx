import "./InputSection.css";

function InputSection({ children, header, className = "" }) {
    return (
        <div className={`input-section ${className}`}>
            {header}
            {children}
        </div>
    );
}

export default InputSection;