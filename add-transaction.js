// Render selects

const addTransactionCategorySelect = document.getElementById("category");
const deleteCategorySelect = document.getElementById("category-delete");

const defaultCategories = [
	"Food 🍔",
	"Transport 🚗",
	"Utilities 💡",
	"Entertainment 🎬",
	"Health 🏥",
	"Education 📚",
	"Clothing 👕",
];

fetch(
	`http://localhost:8080/categories?user_id=${localStorage.getItem("userId")}`
).then((response) => {
	response.json().then((data) => {
		addTransactionCategorySelect.innerHTML = "";
		deleteCategorySelect.innerHTML = "";

		data.forEach((category) => {
			addTransactionCategorySelect.innerHTML +=
				generateCategorySelectHtml(category);

			if (category.user_id !== "default") {
				deleteCategorySelect.innerHTML += generateCategorySelectHtml(category);
			}
		});
	});
});

function generateCategorySelectHtml(category) {
	return `<option value="${category.category_id}">${category.category_name}</option>`;
}

// Add new category

const addCategoryBtn = document.getElementById("add-category-btn");

addCategoryBtn.addEventListener("click", () => {
	const categoryName = document.getElementById("category-name").value;
	if (categoryName === "") {
		alert("Please enter a category name");
		return;
	}
	fetch(
		`http://localhost:8080/categories/add?user_id=${localStorage.getItem(
			"userId"
		)}&name=${categoryName}`
	).then((response) => {
		if (response.status === 200) {
			window.location.href = "app.add-transaction.html";
			alert("Category added successfully");
		} else {
			alert("Error: " + response.status);
		}
	});
});

// Delete category

const deleteCategoryBtn = document.getElementById("category-delete-btn");

deleteCategoryBtn.addEventListener("click", () => {
	const categoryId = document.getElementById("category-delete").value;
	fetch(
		`http://localhost:8080/categories/delete?user_id=${localStorage.getItem(
			"userId"
		)}&category_id=${categoryId}`
	).then((response) => {
		if (response.status === 200) {
			window.location.href = "app.add-transaction.html";
			alert("Category deleted successfully");
		} else {
			alert("Error: " + response.status);
		}
	});
});

// Render wallets

const addTransactionWalletSelect = document.getElementById("account");

fetch(
	`http://localhost:8080/wallets?user_id=${localStorage.getItem("userId")}`
).then((response) => {
	response.json().then((data) => {
		addTransactionWalletSelect.innerHTML = "";
		data.forEach((wallet) => {
			addTransactionWalletSelect.innerHTML += generateWalletSelectHtml(wallet);
		});
	});
});

function generateWalletSelectHtml(wallet) {
	return `<option class="capitalize" value="${wallet.wallet_id}">${wallet.name} - ${wallet.category} ($${wallet.balance})</option>`;
}

// Add new transaction

const addTransactionBtn = document.getElementById("add-transaction-btn");

addTransactionBtn.addEventListener("click", () => {
	let amount = document.getElementById("amount").value;
	const wallet = document.getElementById("account").value;
	const category = document.getElementById("category").value;
	const description = document.getElementById("description").value;
	const date = document.getElementById("date").value;

	const isExpense = document.getElementById("expense").checked;
	const isIncome = document.getElementById("income").checked;

	if (!isExpense && !isIncome) {
		alert("Please select either expense or income");
		return;
	}

	if (isExpense) {
		amount *= -1;
	}

	if (amount === "" || wallet === "" || category === "" || date === "") {
		alert("Please fill in all the fields");
		return;
	}
	fetch(
		`http://localhost:8080/expenses/add?user_id=${localStorage.getItem(
			"userId"
		)}&amount=${amount}&wallet_id=${wallet}&category_id=${category}&description=${description}&date=${date}`
	).then((response) => {
		if (response.status === 200) {
			window.location.href = "app.add-transaction.html";
			alert("Transaction added successfully");
		} else if (response.status === 400) {
			alert("Insufficient funds in the wallet");
		} else {
			alert("Error: " + response.status);
		}
	});
});
