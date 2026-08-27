import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getDate } from "../../utils/date.js";
import { useCurrency } from "../../context/CurrencyContext";
import { getDailyRate, convertJPYtoUSD, convertUSDtoJPY, formatAmount } from "../../utils/currency";

import "./EditBudgetPage.css";
import Card from "../../components/Card.jsx";
import InputSection from "../../components/InputSection.jsx";

function EditBudgetPage() {
    const [month, setMonth] = useState(getDate("month"));
    const [year, setYear] = useState(getDate("year"));
    const [name, setName] = useState("");
    const [limit, setLimit] = useState("");
    const [limitCurrency, setLimitCurrency] = useState("JPY");
    const [categories, setCategories] = useState([]);
    const [hide, setHidden] = useState(false);

    const { displayCurrency } = useCurrency();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!month || !year || !limit || !name || !limitCurrency) return;

        const budgetID = `${year}-${month}`;
        const rate = await getDailyRate();

        let limitJPY, limitUSD;
        if (limitCurrency === "USD") {
            limitUSD = Number(limit);
            limitJPY = convertUSDtoJPY(Number(limit), rate);
        } else {
            limitJPY = Number(limit);
            limitUSD = convertJPYtoUSD(Number(limit), rate);
        }

        const newCategory = {
            name: name,
            limitJPY: limitJPY,
            limitUSD: limitUSD
        };

        await addDoc(collection(db, "budgets", budgetID, "categories"), newCategory);

        setName("");
        setLimit("");
    }

    const deleteCategory = async (id) => {
        const budgetID = `${year}-${month}`;

        await deleteDoc(doc(db, "budgets", budgetID, "categories", id));

        setCategories(categories.filter(e => e.id !== id));
    }

    const fetchBudget = async () => {
        if (!month || !year) return;

        const budgetID = `${year}-${month}`;

        const querySnapshot = await getDocs(collection(db, "budgets", budgetID, "categories"));
        const cats = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setCategories(cats);
        setHidden(hideOrShow());
    }

    const hideOrShow = () => {
        if (month === getDate("month") && year === getDate("year")) {
            return false;
        } else {
            return true;
        }
    }

    useEffect(() => {
        fetchBudget();
    }, [handleSubmit]);

    return (
        <div>
            <h1 className="positive">Set Monthly Budget</h1>
            <div className="inputs">
                <InputSection header={<h3>Get Budget:</h3>}>
                    <div id="get-budget-inputs">
                        <div className="input-option">
                            <label htmlFor="month">Month:</label>
                            <select
                                value={month}
                                id="month"
                                onChange={(e) => setMonth(e.target.value)}
                                required
                            >
                                <option key="01" value="01">January</option>
                                <option key="02" value="02">February</option>
                                <option key="03" value="03">March</option>
                                <option key="04" value="04">April</option>
                                <option key="05" value="05">May</option>
                                <option key="06" value="06">June</option>
                                <option key="07" value="07">July</option>
                                <option key="08" value="08">August</option>
                                <option key="09" value="09">September</option>
                                <option key="10" value="10">October</option>
                                <option key="11" value="11">November</option>
                                <option key="12" value="12">December</option>
                            </select>
                        </div>

                        <div className="input-option">
                            <label htmlFor="year">Year:</label>
                            <input
                                placeholder="Year"
                                value={year}
                                id="year"
                                required
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>
                    </div>
                </InputSection>

                <InputSection header={<h3>Add Category:</h3>}>
                    <form id="add-category-form" onSubmit={handleSubmit}>
                        <div className="input-option">
                            <label htmlFor="cat-name">Category Name:</label>
                            <input
                                placeholder="Name"
                                value={name}
                                id="cat-name"
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="input-option">
                            <label htmlFor="limit">Limit:</label>
                            <input
                                placeholder={limitCurrency === "USD" ? "$" : "¥"}
                                value={limit}
                                id="limit"
                                required
                                onChange={(e) => setLimit(e.target.value)}
                            />
                        </div>

                        <div className="input-option">
                            <label htmlFor="limit-currency">Limit Currency:</label>
                            <select
                                id="limit-currency"
                                value={limitCurrency}
                                onChange={(e) => setLimitCurrency(e.target.value)}
                            >
                                <option value="JPY">¥ JPY</option>
                                <option value="USD">$ USD</option>
                            </select>
                        </div>

                        <button id="submit-btn" type="submit" hidden={hide}>Save Category</button>
                    </form>
                </InputSection>

                <div id="budget-list-section">
                    <h2>Budget So Far...</h2>
                    <ul id="budget-cards">
                        {categories.map((e) => {
                            let limitDisplay;
                            if (displayCurrency === "USD") {
                                limitDisplay = formatAmount(Number(e.limitUSD), "USD");
                            } else {
                                limitDisplay = formatAmount(Number(e.limitJPY), "JPY");
                            }

                            return (
                                <Card header={<div className="card-header">{e.name}</div>}>
                                    <li key={e.id} className="budgetElem">
                                        {limitDisplay}
                                        <button id={e.id} className="delete-btn" hidden={hide} onClick={() => deleteCategory(e.id)}>
                                            Delete
                                        </button>
                                    </li>
                                </Card>
                            );
                        })}
                    </ul>
                </div>
            </div >
        </div>
    );
}

export default EditBudgetPage;