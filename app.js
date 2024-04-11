const host = "http://localhost:8080";

const cardsContainer = document.getElementById("cards-container");
const thisMonthTransactionsLabel =
	document.getElementById("month-transactions");

const transactionsContainer = document.getElementById("transactions-container");

fetch(`${host}/categories?user_id=${localStorage.getItem("userId")}`).then(
	(response) =>
		response.json().then((data) => {
			render(data);
		})
);

function render(categories) {
	cardsContainer.innerHTML = "";
	// Available Money Card
	fetch(`${host}/wallets?user_id=${localStorage.getItem("userId")}`).then(
		(response) =>
			response.json().then((data) => {
				let overallBalance = 0;
				data.forEach((wallet) => {
					overallBalance += wallet.balance;
				});
				cardsContainer.innerHTML +=
					renderAvailableMoneyCardHtml(overallBalance);
			})
	);

	// Transactions Cards + Transactions Table
	fetch(`${host}/expenses?user_id=${localStorage.getItem("userId")}`).then(
		(response) =>
			response.json().then((data) => {
				transactionsContainer.innerHTML = "";
				let thisMonthExpenses = 0;
				let thisMonthIncome = 0;
				let quantity = 0;
				data.reverse();
				data.forEach((transaction) => {
					if (withinLast30Days(transaction.date)) {
						quantity++;
						if (transaction.amount > 0) {
							thisMonthIncome += transaction.amount;
						} else {
							thisMonthExpenses += Math.abs(transaction.amount);
						}
					}

					let categoryName = categories.find(
						(category) => category.category_id === transaction.category_id
					).category_name;

					transactionsContainer.innerHTML += renderTransactionHtml(
						categoryName,
						transaction.description,
						transaction.date.match(/^\d{4}-\d{2}-\d{2}/),
						transaction.amount
					);
				});

				cardsContainer.innerHTML += renderTransactionsCardsHtml(
					thisMonthExpenses,
					thisMonthIncome,
					quantity
				);
				thisMonthTransactionsLabel.innerText = quantity;
			})
	);
}

function renderAvailableMoneyCardHtml(overallBalance) {
	return `<div
							class="relative flex flex-col bg-clip-border h-16 rounded-xl bg-white text-gray-700 shadow-md mt-8">
							<div
								class="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-5 grid h-16 w-16 place-items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									class="w-6 h-6 text-white">
									<path
										d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"></path>
									<path
										fill-rule="evenodd"
										d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
										clip-rule="evenodd"></path>
									<path
										d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z"></path>
								</svg>
							</div>
							<div class="p-4 -mt-3 text-right">
								<p
									class="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
									Available Money
								</p>
								<h4
									class="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
									$${overallBalance}
								</h4>
							</div>
						</div>`;
}

function renderTransactionsCardsHtml(expenses, income, quantity) {
	return (
		renderMonthExpensesCardHtml(expenses) +
		renderMonthIncomeCardHtml(income) +
		renderMonthTransactionsQuantityHtml(quantity)
	);
}

function renderMonthExpensesCardHtml(expenses) {
	return `<div
							class="relative h-16 mt-8 flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
							<div
								class="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-pink-600 to-pink-400 text-white shadow-pink-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="24"
									viewBox="0 -960 960 960"
									width="24">
									<path
										d="M440-647 244-451q-12 12-28 11.5T188-452q-11-12-11.5-28t11.5-28l264-264q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l264 264q11 11 11 27.5T772-452q-12 12-28.5 12T715-452L520-647v447q0 17-11.5 28.5T480-160q-17 0-28.5-11.5T440-200v-447Z"
										fill="#ffffff" />
								</svg>
							</div>
							<div class="p-4 -mt-3 text-right">
								<p
									class="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
									Month Expenses
								</p>
								<h4
									class="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
									$${expenses}
								</h4>
							</div>
						</div>`;
}

function renderMonthIncomeCardHtml(incomes) {
	return `
						<div
							class="relative h-16 mt-8 flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
							<div
								class="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									height="24"
									viewBox="0 -960 960 960"
									width="24">
									<path
										d="M440-313v-447q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v447l196-196q12-12 28-11.5t28 12.5q11 12 11.5 28T772-452L508-188q-6 6-13 8.5t-15 2.5q-8 0-15-2.5t-13-8.5L188-452q-11-11-11-27.5t11-28.5q12-12 28.5-12t28.5 12l195 195Z"
										fill="#ffffff" />
								</svg>
							</div>
							<div class="p-4 -mt-3 text-right">
								<p
									class="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
									Month Income
								</p>
								<h4
									class="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
									$${incomes}
								</h4>
							</div>
						
						</div>`;
}

function renderMonthTransactionsQuantityHtml(quantity) {
	return `
						<div
							class="relative h-16 mt-8 flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
							<div
								class="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									class="w-6 h-6 text-white">
									<path
										d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"></path>
								</svg>
							</div>
							<div class="p-4 -mt-3 text-right">
								<p
									class="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
									Month Transactions
								</p>
								<h4
									class="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
									${quantity}
								</h4>
							</div>
						</div>`;
}

function renderTransactionHtml(category, description, date, amount) {
	return `<tr>
											<td class="py-3 px-5 border-b border-blue-gray-50">
												<div class="flex items-center gap-4">
													<p
														class="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">
														${category ? category : "-"}
													</p>
												</div>
											</td>
											<td class="py-3 px-5 border-b border-blue-gray-50">
												<p
													class="block antialiased font-sans text-xs font-medium text-blue-gray-600 text-right">
													${description ? description : "-"}
												</p>
											</td>
											<td class="py-3 px-5 border-b border-blue-gray-50">
												<p
													class="block antialiased font-sans text-xs font-medium text-blue-gray-600 text-right">
													${date ? date : "-"}
												</p>
											</td>
											<td class="py-3 px-5 border-b border-blue-gray-50">
												<p
													class="block antialiased font-sans text-xs font-medium text-blue-gray-600 text-right ${
														amount > 0 ? "text-green-500" : "text-red-500"
													}">
													${amount > 0 ? `+$${amount}` : `-$${-amount}`}
												</p>
											</td>
										</tr>`;
}

function withinLast30Days(dateString) {
	const inputDate = new Date(dateString);
	const currentDate = new Date();
	const thirtyDaysAgo = currentDate.getTime() - 30 * 24 * 60 * 60 * 1000;
	return (
		inputDate.getTime() >= thirtyDaysAgo &&
		inputDate.getTime() <= currentDate.getTime()
	);
}
