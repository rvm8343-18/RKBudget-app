import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getDate } from "../../utils/date.js";
import { formatAmount } from "../../utils/currency";

import "./ExpensesHistoryPage.css";
import Card from "../../components/Card.jsx";
import InputSection from "../../components/InputSection.jsx";

function ExpensesPage() {
    const [month, setMonth] = useState(getDate("month"));
    const [year, setYear] = useState(getDate("year"));
    const [expenses, setExpenses] = useState([]);
    const [hide, setHidden] = useState(false);

    const displayAmount = (expense, whatCurrency) => {
        if (whatCurrency == "USD") {
            return formatAmount(expense.amountUSD, "USD");
        }
        return formatAmount(expense.amountJPY, "JPY");
    };

    const deleteExpense = async (id) => {
        await deleteDoc(doc(db, "budgets", `${year}-${month}`, "expenses", id));
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const getExpenses = async () => {
        if (!month || !year) return;

        const budgetID = `${year}-${month}`;

        const querySnapshot = await getDocs(collection(db, "budgets", budgetID, "expenses"));
        const expns = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setExpenses(expns);
        setHidden(hideOrShow());
    };

    const hideOrShow = () => {
        if (month === getDate("month") && year === getDate("year")) {
            return false;
        } else {
            return true;
        }
    }

    useEffect(() => {
        getExpenses();
    }, []);

    return (
        <div>
            <h1>{month}/{year} Expenses</h1>
            <InputSection id="input-section" header={<h2>Get Expenses</h2>}>
                <div className="input-option">
                    <label htmlFor="month">Month:</label>
                    <select
                        id="month"
                        value={month}
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
                        id="year"
                        placeholder="Year"
                        value={year}
                        required
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>

                <div>
                    <button id="submit-btn" onClick={getExpenses}>Get Expenses</button>
                </div>
            </InputSection>

            <ul id="expense-cards">
                {expenses.map((e) => (
                    <li key={e.id}>
                        <Card header={<h2 className="card-header">{e.category}</h2>} clickable={false}>
                            <div className="detail-items"><div>Amount JPY: </div><div className="details">{displayAmount(e, "JYP")}</div></div>
                            <div className="detail-items"><div>Amount USD: </div><div className="details">{displayAmount(e, "USD")}</div></div>
                            <div className="detail-items"><div>Date: </div><div className="details">{e.purchaseDate ?? "—"}</div></div>
                            <div className="detail-items"><div>User: </div><div className="details">{e.user}</div></div>
                            <div className="detail-items"><div>Memo: </div><div className="details">{e.memo}</div></div>
                        </Card>
                        <button id={e.id} className="delete-btn" hidden={hide} onClick={() => deleteExpense(e.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div >
    );
}

export default ExpensesPage;