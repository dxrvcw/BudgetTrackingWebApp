const host = "http://136.244.81.173:8080";
const transactionsContainer = document.getElementById("transactions-container");

// Fetch transactions

const userId = localStorage.getItem("userId");

let transactionsData = [];
let walletsData = [];
let categoriesData = [];

Promise.all([
	fetch(`${host}/expenses?user_id=${userId}`).then((response) =>
		response.json()
	),
	fetch(`${host}/wallets?user_id=${userId}`).then((response) =>
		response.json()
	),
	fetch(`${host}/categories?user_id=${userId}`).then((response) =>
		response.json()
	),
])
	.then(([expenses, wallets, categories]) => {
		expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
		transactionsData = expenses;
		walletsData = wallets;
		categoriesData = categories;

		categories.forEach((category) => {
			const option = document.createElement("option");
			option.value = category.category_id;
			option.text = category.category_name;
			const categorySelect = document.getElementById("search-category");
			categorySelect.appendChild(option);
		});

		wallets.forEach((wallet) => {
			const option = document.createElement("option");
			option.value = wallet.wallet_id;
			option.text =
				wallet.name + " - " + wallet.category + " ($" + wallet.balance + ")";
			const walletSelect = document.getElementById("search-wallet");
			walletSelect.appendChild(option);
		});

		transactionsContainer.innerHTML = generateTransactionsHtml(
			expenses,
			wallets,
			categories
		);
		const deleteButtons = document.querySelectorAll("#delete-expense-btn");

		deleteButtons.forEach((button) => {
			button.addEventListener("click", (e) => deleteExpense(button.value));
		});
	})
	.catch((error) => {
		console.error("Error fetching data:", error);
	});

function generateTransactionsHtml(expenses, wallets, categories) {
	expenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

	let transactionsHtml = `<p class="text-xs uppercase text-left border-b-2 py-2">
								Category
							</p>
							<p class="text-xs uppercase text-left border-b-2 py-2">
								Description
							</p>
							<p class="text-xs uppercase text-right border-b-2 py-2">Wallet</p>
							<p class="text-xs uppercase text-right border-b-2 py-2">Date</p>
							<p class="text-xs uppercase text-right border-b-2 py-2">Amount</p>
							<p class="text-xs uppercase text-center border-b-2 py-2">
								Delete
							</p>`;

	expenses.forEach((expense) => {
		let wallet = wallets.find((w) => w.wallet_id === expense.wallet_id);

		let category = categories.find(
			(c) => c.category_id === expense.category_id
		);

		transactionsHtml += `<p
								class="text-sm font-semibold capitalize text-left border-b-2 py-2">
								${category ? category.category_name : "No Category"}
							</p>
							<p class="text-xs capitalize text-left border-b-2 py-2">
                ${expense.description ? expense.description : "-"}
							</p>
							<p class="text-xs capitalize text-right border-b-2 py-2">
                <span class="font-semibold">${
									wallet ? wallet.name : "No Wallet"
								}</span> (${wallet ? wallet.category : ""})
							</p>
							<p class="text-xs capitalize text-right border-b-2 py-2">
								${expense.date.match(/\d{4}-\d{2}-\d{2}/)}
							</p>
							<p
								class="text-xs capitalize text-right border-b-2 py-2 ${
									expense.amount < 0 ? "text-red-500" : "text-green-500"
								}">
                ${
									expense.amount < 0
										? "-$" + expense.amount * -1
										: "$" + expense.amount
								}
							</p>
							<button
								value="${expense.expense_id}"
                id="delete-expense-btn"
								class="rounded-md flex justify-center items-center h-6 m-auto w-6 bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40 active:opacity-[0.85]">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="24"
									viewBox="0 -960 960 960"
									width="24">
									<path
										d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
										fill="#ffffff" />
								</svg>
							</button>`;
	});
	return transactionsHtml;
}

function deleteExpense(expenseId) {
	fetch(
		`${host}/expenses/delete?user_id=${localStorage.getItem(
			"userId"
		)}&expense_id=${expenseId}`
	)
		.then(() => {
			location.href = "transactions.html";
			alert("Transaction deleted successfully");
		})
		.catch((error) => {
			alert("Error: " + error);
		});
}

// Wallet Overview

const walletsContainer = document.getElementById("wallets-container");

fetch(`${host}/wallets?user_id=${localStorage.getItem("userId")}`)
	.then((response) => {
		return response.json();
	})
	.then((wallets) => {
		walletsContainer.innerHTML = "";
		wallets.forEach((wallet) => {
			walletsContainer.innerHTML += generateWalletHtml(wallet);
		});
	});

function generateWalletHtml(wallet) {
	return `<div class="bg-white shadow-md rounded-lg p-4">
								<p class="text-sm leading-normal font-bold capitalize">${wallet.category}</p>
								<div class="flex w-full justify-between">
									<p class="text-sm leading-normal">${wallet.name}</p>
									<p class="text-sm leading-normal text-right">$${wallet.balance}</p>
								</div>
							</div>`;
}

// Search transactions

const searchDateFrom = document.getElementById("search-date-from");
const searchDateTo = document.getElementById("search-date-to");
const searchCategory = document.getElementById("search-category");
const searchWallet = document.getElementById("search-wallet");

searchDateFrom.addEventListener("change", handleSearch);
searchDateTo.addEventListener("change", handleSearch);
searchCategory.addEventListener("change", handleSearch);
searchWallet.addEventListener("change", handleSearch);

function handleSearch() {
	const dateFrom = searchDateFrom.value;
	const dateTo = searchDateTo.value;
	const category = searchCategory.value;
	const wallet = searchWallet.value;

	let data = [...transactionsData];
	data = data.filter((expense) => {
		if (category === "all-categories") {
			return true;
		} else {
			return expense.category_id === category;
		}
	});

	if (!!dateFrom) {
		data = data.filter((expense) => {
			return new Date(expense.date) >= new Date(dateFrom);
		});
	}

	if (!!dateTo) {
		data = data.filter((expense) => {
			return new Date(expense.date) <= new Date(dateTo);
		});
	}

	data = data.filter((expense) => {
		if (wallet === "all-wallets") {
			return true;
		} else {
			return expense.wallet_id === wallet;
		}
	});

	transactionsContainer.innerHTML = generateTransactionsHtml(
		data,
		walletsData,
		categoriesData
	);
}
