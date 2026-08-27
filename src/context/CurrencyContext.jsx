import { createContext, useContext, useState } from "react";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    const [displayCurrency, setDisplayCurrency] = useState(
        () => localStorage.getItem("displayCurrency") || "JPY"
    );

    const toggleCurrency = () => {
        setDisplayCurrency((prev) => {
            const next = prev === "JPY" ? "USD" : "JPY";
            localStorage.setItem("displayCurrency", next);
            return next;
        });
    };

    return (
        <CurrencyContext.Provider value={{ displayCurrency, toggleCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return ctx;
}
