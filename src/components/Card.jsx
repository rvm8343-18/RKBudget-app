import { useState } from 'react';
import "./Card.css";

function Card({ children, header, clickable, className = "" }) {
    const [isVisible, setIsVisible] = useState(false);

    if (clickable) {
        return (
            <button className={`card ${className}`} onClick={() => setIsVisible(!isVisible)}>
                {header}
                {isVisible &&
                    children
                }
            </button>
        );
    } else {
        return (
            <div className={`card ${className}`}>
                {header}
                {children}
            </div>
        );
    }

}

export default Card;