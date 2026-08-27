import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { getDate } from "./date.js";

const DAILY_RATE_CACHE_KEY = "jpy_usd_daily_rate";
const HISTORICAL_RATE_CACHE_PREFIX = "jpy_usd_rate_";

// Rate for a specific "YYYY-MM-DD" purchase date. Historical rates never
// change once published, so once fetched they're cached in localStorage
// permanently (today's rate is provisional, so it's re-fetched each call
// rather than cached forever).
export async function getRateForDate(dateStr) {
    const today = new Date().toISOString().slice(0, 10);

    if (dateStr !== today) {
        try {
            const cached = localStorage.getItem(HISTORICAL_RATE_CACHE_PREFIX + dateStr);
            if (cached) return Number(cached);
        } catch {
            // ignore corrupted cache
        }
    }

    const rate = await fetchRateFromApi(dateStr === today ? "latest" : dateStr);

    if (dateStr !== today) {
        localStorage.setItem(HISTORICAL_RATE_CACHE_PREFIX + dateStr, String(rate));
    }

    return rate;
}

// Calls the (free, no-API-key) Frankfurter exchange rate API.
// `dateOrLatest` is either "latest" or a "YYYY-MM-DD" historical date.
async function fetchRateFromApi(dateOrLatest) {
    const url = `https://api.frankfurter.dev/v1/${dateOrLatest}?from=JPY&to=USD`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch exchange rate (${res.status})`);
    }

    const data = await res.json();
    const rate = data?.rates?.USD;

    if (!rate) {
        throw new Error("Exchange rate response missing USD rate");
    }

    return rate;
}

// Today's JPY->USD rate, cached in localStorage and refreshed at most once per day.
export async function getDailyRate() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        const cached = JSON.parse(localStorage.getItem(DAILY_RATE_CACHE_KEY) || "null");
        if (cached && cached.date === today && typeof cached.rate === "number") {
            return cached.rate;
        }
    } catch {
        // ignore corrupted cache and refetch below
    }

    const rate = await fetchRateFromApi("latest");
    localStorage.setItem(DAILY_RATE_CACHE_KEY, JSON.stringify({ date: today, rate }));
    return rate;
}

// Last calendar day (YYYY-MM-DD) of a "YYYY-MM" budget id.
function lastDayOfMonth(budgetID) {
    const [year, month] = budgetID.split("-").map(Number);
    const d = new Date(year, month, 0); // day 0 of next month = last day of this month
    return d.toISOString().slice(0, 10);
}

// True if the budget's month has already fully finished (strictly before this month).
export function isPastMonth(budgetID) {
    const [year, month] = budgetID.split("-").map(Number);
    const currentYear = Number(getDate("year"));
    const currentMonth = Number(getDate("month"));

    return year < currentYear || (year === currentYear && month < currentMonth);
}

// Rate locked in permanently on the budget's Firestore doc the first time it's needed,
// using the exchange rate from the last day of that month. Shared across every device/user
// so a closed month's numbers never change again.
export async function getLockedRate(budgetID) {
    const budgetRef = doc(db, "budgets", budgetID);
    const snap = await getDoc(budgetRef);
    const existing = snap.exists() ? snap.data()?.lockedRate?.JPY_USD : undefined;

    if (typeof existing === "number") {
        return existing;
    }

    const rate = await fetchRateFromApi(lastDayOfMonth(budgetID));
    await setDoc(budgetRef, { lockedRate: { JPY_USD: rate } }, { merge: true });
    return rate;
}

// The rate to use for a given "YYYY-MM" budget: locked historical rate for past months,
// daily-cached live rate for the current (or a future) month.
export async function getRateForBudget(budgetID) {
    if (isPastMonth(budgetID)) {
        return getLockedRate(budgetID);
    }
    return getDailyRate();
}

export function convertJPYtoUSD(amountJPY, rate) {
    return amountJPY * rate;
}

export function convertUSDtoJPY(amountUSD, rate) {
    return amountUSD / rate;
}

export function formatAmount(amount, currency) {
    if (currency === "USD") {
        return `$${amount.toFixed(2)}`;
    }
    return `¥${Math.round(amount).toLocaleString()}`;
}
