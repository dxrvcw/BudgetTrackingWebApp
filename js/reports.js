const host = "http://136.244.81.173:443";
const userId = localStorage.getItem("userId");

let expensesData = [];
let categoriesData = [];

Promise.all([
	fetch(`${host}/expenses?user_id=${userId}`).then((response) =>
		response.json()
	),
	fetch(`${host}/categories?user_id=${userId}`).then((response) =>
		response.json()
	),
])
	.then(([expenses, categories]) => {
		expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
		expensesData = expenses;

		categoriesData = categories;

		renderCategories(categories);
		renderCards(expenses);
		renderChart(expenses);
		renderPieChart(expenses);
	})
	.catch((error) => {
		console.error("Error fetching data:", error);
	});

function renderCategories(categories) {
	const categorySelect = document.getElementById("category-select");
	categories.forEach((category) => {
		const option = document.createElement("option");
		option.value = category.category_id;
		option.text = category.category_name;
		categorySelect.appendChild(option);
	});
}

function renderCards(expenses) {
	const totalExpensesLabel = document.getElementById("total-expenses");
	const totalIncomeLabel = document.getElementById("total-income");
	const totalTransactionsLabel = document.getElementById("total-transactions");

	const totalExpenses = expenses.reduce((acc, expense) => {
		if (expense.amount < 0) {
			acc += Math.abs(expense.amount);
		}
		return acc;
	}, 0);

	const totalIncome = expenses.reduce((acc, expense) => {
		if (expense.amount > 0) {
			acc += expense.amount;
		}
		return acc;
	}, 0);

	const totalTransactions = expenses.length;

	totalExpensesLabel.innerText = `$${totalExpenses.toFixed(1)}`;
	totalIncomeLabel.innerText = `$${totalIncome.toFixed(1)}`;
	totalTransactionsLabel.innerText = totalTransactions;
}

function renderChart(expenses) {
	const chartContainer = document.getElementById("chart-container");
	chartContainer.innerHTML = "<canvas id='chart'></canvas>";

	const ctx = document.getElementById("chart");

	const incomesData = {};
	const expensesData = {};
	const transactionsData = {};

	expenses.forEach((expense) => {
		const date = getRefactoredDate(expense.date);

		if (!transactionsData[date]) {
			transactionsData[date] = 1;
		} else {
			transactionsData[date]++;
		}

		if (expense.amount > 0) {
			if (!incomesData[date]) {
				incomesData[date] = expense.amount;
			} else {
				incomesData[date] += expense.amount;
			}
			expensesData[date] = 0;
		} else {
			if (!expensesData[date]) {
				expensesData[date] = Math.abs(expense.amount);
			} else {
				expensesData[date] += Math.abs(expense.amount);
			}
			incomesData[date] = 0;
		}
	});

	const data = {
		datasets: [
			{
				label: "Incomes",
				data: incomesData,
				borderColor: "#2bc454",
				yAxisID: "y",
			},
			{
				label: "Expenses",
				data: expensesData,
				borderColor: "#e33939",
				yAxisID: "y",
			},
			{
				label: "Transactions",
				data: transactionsData,
				borderColor: "#000000",
				yAxisID: "y1",
			},
		],
	};

	const config = {
		type: "line",
		data: data,
		options: {
			responsive: true,
			interaction: {
				mode: "index",
				intersect: false,
			},
			stacked: false,
			plugins: {
				title: {
					display: false,
					text: "Chart",
				},
			},
			scales: {
				y: {
					type: "linear",
					display: true,
					position: "left",
					title: {
						display: true,
						text: "Amount",
					},
				},
				y1: {
					type: "linear",
					display: true,
					position: "right",
					title: {
						display: true,
						text: "Transactions",
					},

					ticks: {
						stepSize: 1,
					},
				},
			},
		},
	};

	new Chart(ctx, config);
}

function renderPieChart(expenses) {
	const pieChartContainer = document.getElementById("pie-chart-container");
	pieChartContainer.innerHTML = "<canvas id='pie-chart'></canvas>";
	const ctx = document.getElementById("pie-chart");

	const chartExpensesData = {};
	const chartIncomesData = {};
	const categoryNames = [];

	expenses.forEach((expense) => {
		const categoryId = expense.category_id;
		const category = categoriesData.find(
			(category) => category.category_id === categoryId
		);

		const categoryName = category ? category.category_name : "No category";

		console.log(categoryName);

		if (!categoryNames.includes(categoryName)) {
			categoryNames.push(categoryName);
		}
		if (!chartExpensesData["_" + categoryName]) {
			chartExpensesData["_" + categoryName] = 0;
		}

		if (!chartIncomesData["_" + categoryName]) {
			chartIncomesData["_" + categoryName] = 0;
		}
		if (expense.amount < 0) {
			chartExpensesData["_" + categoryName] += Math.abs(expense.amount);
		} else {
			chartIncomesData["_" + categoryName] += expense.amount;
		}
	});

	const data = {
		labels: categoryNames,
		datasets: [
			{
				label: "Expenses",
				data: Object.values(chartExpensesData),
			},
			{
				label: "Incomes",
				data: Object.values(chartIncomesData),
			},
		],
	};

	const config = {
		type: "doughnut",
		data: data,
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
				},
			},
		},
	};

	new Chart(ctx, config);
}

function getRefactoredDate(date) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const parsedDate = new Date(date);
	const year = parsedDate.getFullYear();
	const monthIndex = parsedDate.getMonth();
	return `${year} ${months[monthIndex]}`;
}

document
	.getElementById("category-select")
	.addEventListener("change", handleSearch);

document.getElementById("start-date").addEventListener("change", handleSearch);

document.getElementById("end-date").addEventListener("change", handleSearch);

function handleSearch() {
	const categoryId = document.getElementById("category-select").value;
	const fromDate = document.getElementById("start-date").value;
	const toDate = document.getElementById("end-date").value;

	let data = [...expensesData];
	data = data.filter((expense) => {
		if (categoryId === "all") {
			return true;
		} else {
			return expense.category_id === categoryId;
		}
	});

	if (!!fromDate) {
		data = data.filter((expense) => {
			return new Date(expense.date) >= new Date(fromDate);
		});
	}

	if (!!toDate) {
		data = data.filter((expense) => {
			return new Date(expense.date) <= new Date(toDate);
		});
	}

	renderCards(data);
	renderChart(data);
	renderPieChart(data);
}
