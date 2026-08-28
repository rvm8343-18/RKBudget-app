import { useState, useEffect } from "react";
import { db } from "../../services/firebase.js"
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getDate } from "../../utils/date";
import { useCurrency } from "../../context/CurrencyContext";
import { getRateForDate, convertJPYtoUSD, convertUSDtoJPY, formatAmount } from "../../utils/currency";
import "./BudgetStatsPage.css";
import Card from "../../components/Card.jsx";

function BudgetStatsPage() {
    const [amount, setAmount] = useState("");
    const [expenseCurrency, setExpenseCurrency] = useState("JPY");
    const [category, setCategory] = useState("");
    const [memo, setMemo] = useState("");
    const [user, setUser] = useState("Rayna");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const { displayCurrency } = useCurrency(); // ask why destructuring?
    const budgetID = getDate("full");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !expenseCurrency || !category || !user || !purchaseDate) return;

        const rateAtPurchase = await getRateForDate(purchaseDate);

        let amountJPY, amountUSD;
        if (expenseCurrency === "USD") {
            amountUSD = Number(amount);
            amountJPY = convertUSDtoJPY(Number(amount), rateAtPurchase);
        } else {
            amountJPY = Number(amount);
            amountUSD = convertJPYtoUSD(Number(amount), rateAtPurchase);
        }

        const newExpense = {
            amountJPY: amountJPY,
            amountUSD: amountUSD,
            originalCurrency: expenseCurrency,
            rate: rateAtPurchase,
            purchaseDate: purchaseDate,
            category: category,
            memo: memo,
            user: user,
            date: new Date().toISOString(), // when it was logged, distinct from purchaseDate
        };

        await addDoc(collection(db, "budgets", budgetID, "expenses"), newExpense);
        setExpenses([...expenses, newExpense]);
        setAmount("");
        setMemo("");
    };

    const getTotalSpentJPY = (name) =>
        expenses.filter((e) => e.category === name).reduce((sum, e) => sum + e.amountJPY, 0);

    const getTotalSpentUSD = (name) =>
        expenses.filter((e) => e.category === name).reduce((sum, e) => sum + e.amountUSD, 0);

    useEffect(() => {
        const fetchExpenses = async () => {
            const querySnapshot = await getDocs(collection(db, "budgets", budgetID, "expenses"));
            const expns = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setExpenses(expns);
        };

        const fetchCategories = async () => {
            const querySnapshot = await getDocs(collection(db, "budgets", budgetID, "categories"));
            const cats = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setCategories(cats);
        };

        fetchCategories();
        fetchExpenses();
    }, []);

    return (
        <div id="main">
            <div>
                <h1>RK {getDate("title")} Budget</h1>

                <div id="remaining-budget">
                    <h2>Remaining Budget</h2>
                    <ul id="budget-cards">
                        {categories.map((e) => {
                            let spentDisplay, remainingDisplay, limitDisplay;
                            if (displayCurrency === "USD") {
                                const spentUSD = getTotalSpentUSD(e.name);
                                const remainingUSD = e.limitUSD - spentUSD;
                                spentDisplay = formatAmount(spentUSD, "USD");
                                remainingDisplay = formatAmount(remainingUSD, "USD");
                                limitDisplay = formatAmount(e.limitUSD, "USD");
                            } else {
                                const spentJPY = getTotalSpentJPY(e.name);
                                const remainingJPY = e.limitJPY - spentJPY;
                                spentDisplay = formatAmount(spentJPY, "JPY");
                                remainingDisplay = formatAmount(remainingJPY, "JPY");
                                limitDisplay = formatAmount(e.limitJPY, "JPY");
                            }

                            return (
                                <li key={e.id}>
                                    <Card className="budget-card" header={<div><div className="card-header">{e.name}:</div><div className="card-header">{remainingDisplay}</div></div>} clickable={true}>

                                        <div>Amount Spent: {spentDisplay}</div>
                                        <div>Starting Budget: {limitDisplay}</div>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div id="add-expense">
                    <h2 id="add-expense-header">Add Expense</h2>
                    <form onSubmit={handleSubmit} id="expense-form">
                        <div id="expense-grid">

                            <div className="expense-grid-item">
                                <label htmlFor="amount">Amount:</label>
                                <input
                                    id="amount"
                                    type="number"
                                    placeholder={expenseCurrency === "USD" ? "$" : "¥"}
                                    value={amount}
                                    required
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="expense-grid-item">
                                <label htmlFor="expense-currency">Currency:</label>
                                <select
                                    id="expense-currency"
                                    value={expenseCurrency}
                                    onChange={(e) => setExpenseCurrency(e.target.value)}
                                >
                                    <option value="JPY">¥ JPY</option>
                                    <option value="USD">$ USD</option>
                                </select>
                            </div>

                            <div className="expense-grid-item">
                                <label htmlFor="category">Category:</label>
                                <select
                                    id="category"
                                    value={category}
                                    required
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map((e) => (
                                        <option key={e.id} value={e.name}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="expense-grid-item">
                                <label htmlFor="user">User:</label>
                                <select id="user" value={user} onChange={(e) => setUser(e.target.value)}>
                                    <option key="R" value="Rayna">Rayna</option>
                                    <option key="K" value="Keiki">Keiki</option>
                                </select>
                            </div>

                            <div className="expense-grid-item">
                                <label htmlFor="purchase-date">Date:</label>
                                <input
                                    id="purchase-date"
                                    type="date"
                                    value={purchaseDate}
                                    required
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                />
                            </div>

                            <div className="expense-grid-item">
                                <label htmlFor="memo">Memo:</label>
                                <input
                                    id="memo"
                                    type="text"
                                    placeholder="..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                            </div>

                        </div>
                        <button type="submit" id="submit-btn">Add Expense</button>
                    </form>
                </div>
            </div>
        </div >
    );

}

export default BudgetStatsPage;