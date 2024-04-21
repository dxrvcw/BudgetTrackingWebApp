const http = require("http");
const url = require("url");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "budget_tracker",
	charset: "utf8mb4",
});

connection.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL database:", err);
		return;
	}
	console.log("Connected to MySQL database");
});

function handleRequest(request, response) {
	let { pathname, query } = url.parse(request.url, true);

	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS"
	);
	response.setHeader("Access-Control-Allow-Headers", "Content-Type");
	response.setHeader("Content-Type", "application/json");

	switch (pathname) {
		case "/":
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.end("404 Not Found\n");
			break;
		case "/register":
			register(query, response);
			break;
		case "/login":
			login(query, response);
			break;
		case "/wallets":
			getWalletsByUserId(query.user_id, response);
			break;
		case "/wallets/add":
			addWalletToDb(
				query.user_id,
				query.category,
				query.name,
				query.balance,
				response
			);
			break;
		case "/wallets/delete":
			deleteWallet(query.user_id, query.wallet_id, response);
			break;
		case "/expenses":
			getExpensesByUserId(query.user_id, response);
			break;
		case "/expenses/add":
			addExpenseToDb(
				query.user_id,
				query.category_id,
				query.wallet_id,
				query.amount,
				query.description,
				query.date,
				response
			);
			break;
		case "/expenses/delete":
			deleteExpense(query.user_id, query.expense_id, response);
			break;
		case "/categories":
			getCategoriesByUserId(query.user_id, response);
			break;
		case "/categories/add":
			addCategoryToDb(query.user_id, query.name, response);
			break;
		case "/categories/delete":
			deleteCategory(query.user_id, query.category_id, response);
			break;
		default:
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.end("404 Not Found\n");
	}
}

function register(query, response) {
	let { login, password } = query;
	// Hash the password
	bcrypt.hash(password, 10, (err, hashedPassword) => {
		if (err) {
			console.error("Error hashing password:", err);
			response.writeHead(500, { "Content-Type": "text/plain" });
			response.end("Error hashing password\n");
			return;
		}
		addUserToDB(login, hashedPassword, response);
	});
}

function login(query, response) {
	let { login, password } = query;
	checkUserInDB(login, password, response);
}

const corsMiddleware = cors({
	origin: "*",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	preflightContinue: false,
	optionsSuccessStatus: 204,
});

const server = http.createServer((req, res) => {
	corsMiddleware(req, res, () => {
		handleRequest(req, res);
	});
});

server.listen(8080);
console.log(`Server is running at http://localhost:8080`);

function addUserToDB(login, password, response) {
	const userData = {
		user_id: generateUserId(),
		password: password,
		email: login,
	};

	connection.query("INSERT INTO users SET ?", userData, (err, result) => {
		if (err) {
			console.error("Error adding user:", err);
			response.writeHead(401, { "Content-Type": "text/plain" });
			response.end("Error with adding user\n");
			return;
		}
		console.log("User added successfully");
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("Added User successfully\n");
	});
}

function checkUserInDB(login, password, response) {
	connection.query(
		"SELECT user_id, password FROM users WHERE email = ?",
		[login],
		(err, result) => {
			if (err) {
				console.error("Error checking user:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error checking user\n");
				return;
			}

			if (result.length === 0) {
				console.log("User not found");
				response.writeHead(401, { "Content-Type": "text/plain" });
				response.end("User not found\n");
				return;
			}

			const hashedPassword = result[0].password;
			bcrypt.compare(password, hashedPassword, (err, isValid) => {
				if (err) {
					console.error("Error comparing passwords:", err);
					response.writeHead(500, { "Content-Type": "text/plain" });
					response.end("Error comparing passwords\n");
					return;
				}
				if (!isValid) {
					console.log("Password incorrect");
					response.writeHead(401, { "Content-Type": "text/plain" });
					response.end("Password incorrect\n");
					return;
				}
				console.log("Logged in successfully");
				const userId = result[0].user_id;
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(JSON.stringify({ userId, email: login }));
			});
		}
	);
}

function addWalletToDb(userId, category, name, balance, response) {
	const walletData = {
		wallet_id: generateWalletId(),
		user_id: userId,
		category: category,
		name: name,
		balance: balance,
	};

	connection.query("INSERT INTO wallets SET ?", walletData, (err, result) => {
		if (err) {
			console.error("Error adding wallet:", err);
			response.writeHead(401, { "Content-Type": "text/plain" });
			response.end("Error with adding wallet\n");
			return;
		}
		console.log("Wallet added successfully");
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end("Added wallet successfully\n");
	});
}

function getWalletsByUserId(userId, response) {
	connection.query(
		"SELECT * FROM wallets WHERE user_id = ?",
		[userId],
		(err, result) => {
			if (err) {
				console.error("Error getting wallets:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error getting wallets\n");
				return;
			}
			console.log("Wallets retrieved successfully");
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(JSON.stringify(result));
		}
	);
}

function deleteWallet(userId, walletId, response) {
	connection.query(
		"DELETE FROM wallets WHERE user_id = ? AND wallet_id = ?",
		[userId, walletId],
		(err, result) => {
			if (err) {
				console.error("Error deleting wallet:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error deleting wallet\n");
				return;
			}
			console.log("Wallet deleted successfully");
			response.writeHead(200, { "Content-Type": "text/plain" });
			response.end("Deleted wallet successfully\n");
		}
	);
}

function addExpenseToDb(
	userId,
	categoryId,
	walletId,
	amount,
	description,
	date,
	response
) {
	// Check if there is enough available balance in the wallet
	connection.query(
		"SELECT balance FROM wallets WHERE user_id = ? AND wallet_id = ?",
		[userId, walletId],
		(err, result) => {
			if (err) {
				console.error("Error retrieving wallet balance:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error retrieving wallet balance\n");
				return;
			}

			const walletBalance = result[0].balance;

			if (walletBalance < -amount) {
				console.log("Insufficient funds in the wallet");
				response.writeHead(400, { "Content-Type": "text/plain" });
				response.end("Insufficient funds in the wallet\n");
				return;
			}

			const expenseData = {
				expense_id: generateExpenseId(),
				user_id: userId,
				category_id: categoryId,
				wallet_id: walletId,
				amount: amount,
				description: description,
				date: date,
			};

			connection.query(
				"INSERT INTO expenses SET ?",
				expenseData,
				(err, result) => {
					if (err) {
						console.error("Error adding expense:", err);
						response.writeHead(401, { "Content-Type": "text/plain" });
						response.end("Error with adding expense\n");
						return;
					}

					connection.query(
						"UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND wallet_id = ?",
						[amount, userId, walletId],
						(err, result) => {
							if (err) {
								console.error("Error updating wallet balance:", err);
								response.writeHead(500, { "Content-Type": "text/plain" });
								response.end("Error updating wallet balance\n");
								return;
							}
							console.log("Wallet balance updated successfully");
							response.writeHead(200, { "Content-Type": "text/plain" });
							response.end("Updated wallet balance successfully\n");
						}
					);
				}
			);
		}
	);
}

function getExpensesByUserId(userId, response) {
	connection.query(
		"SELECT * FROM expenses WHERE user_id = ?",
		[userId],
		(err, result) => {
			if (err) {
				console.error("Error getting expenses:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error getting expenses\n");
				return;
			}
			console.log("Expenses retrieved successfully");
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(JSON.stringify(result));
		}
	);
}

function deleteExpense(userId, expenseId, response) {
	// Retrieve the amount of the deleted expense
	connection.query(
		"SELECT amount, wallet_id FROM expenses WHERE user_id = ? AND expense_id = ?",
		[userId, expenseId],
		(err, result) => {
			if (err) {
				console.error("Error retrieving expense:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error retrieving expense\n");
				return;
			}

			if (result.length === 0) {
				console.log("Expense not found");
				response.writeHead(404, { "Content-Type": "text/plain" });
				response.end("Expense not found\n");
				return;
			}

			const { amount, wallet_id } = result[0];

			// Delete the expense
			connection.query(
				"DELETE FROM expenses WHERE user_id = ? AND expense_id = ?",
				[userId, expenseId],
				(err, result) => {
					if (err) {
						console.error("Error deleting expense:", err);
						response.writeHead(500, { "Content-Type": "text/plain" });
						response.end("Error deleting expense\n");
						return;
					}

					// Add the expense amount back to the wallet balance
					connection.query(
						"UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND wallet_id = ?",
						[amount, userId, wallet_id],
						(err, result) => {
							if (err) {
								console.error("Error updating wallet balance:", err);
								response.writeHead(500, { "Content-Type": "text/plain" });
								response.end("Error updating wallet balance\n");
								return;
							}
							console.log(
								"Expense deleted successfully and amount returned to wallet"
							);
							response.writeHead(200, { "Content-Type": "text/plain" });
							response.end(
								"Expense deleted successfully and amount returned to wallet\n"
							);
						}
					);
				}
			);
		}
	);
}

function addCategoryToDb(userId, categoryName, response) {
	const categoryData = {
		category_id: generateCategoryId(), // Generate unique category ID
		category_name: categoryName,
		user_id: userId,
	};

	connection.query(
		"INSERT INTO categories SET ?",
		categoryData,
		(err, result) => {
			if (err) {
				console.error("Error adding category:", err);
				response.writeHead(401, { "Content-Type": "text/plain" });
				response.end("Error with adding category\n");
				return;
			}
			console.log("Category added successfully");
			response.writeHead(200, { "Content-Type": "text/plain" });
			response.end("Added category successfully\n");
		}
	);
}

function getCategoriesByUserId(userId, response) {
	connection.query(
		"SELECT * FROM categories WHERE user_id = 'user_1712941832613j9lwp9' OR user_id = 'default'",
		[userId],
		(err, result) => {
			if (err) {
				console.error("Error getting categories:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error getting categories\n");
				return;
			}
			console.log("Categories retrieved successfully");
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(JSON.stringify(result));
		}
	);
}

function deleteCategory(userId, category_id, response) {
	connection.query(
		"DELETE FROM categories WHERE user_id = ? AND category_id = ?",
		[userId, category_id],
		(err, result) => {
			if (err) {
				console.error("Error deleting category:", err);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("Error deleting category\n");
				return;
			}
			console.log("Category deleted successfully");
			response.writeHead(200, { "Content-Type": "text/plain" });
			response.end("Deleted category successfully\n");
		}
	);
}

function generateUserId() {
	return "user_" + Date.now() + Math.random().toString(36).substring(2, 8);
}
function generateCategoryId() {
	return "category_" + Date.now() + Math.random().toString(36).substring(2, 8);
}
function generateWalletId() {
	return "wallet_" + Date.now() + Math.random().toString(36).substring(2, 8);
}
function generateExpenseId() {
	return "expense_" + Date.now() + Math.random().toString(36).substring(2, 8);
}
