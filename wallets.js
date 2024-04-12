// Generate options for delete

fetch(
	`http://localhost:8080/wallets?user_id=${localStorage.getItem("userId")}`
).then((response) => {
	response.json().then((wallets) => {
		document.getElementById("wallet-delete").innerHTML =
			renderDeleteOptionsHml(wallets);
	});
});

function renderDeleteOptionsHml(wallets) {
	let options = "";
	wallets.forEach((wallet) => {
		options += `<option value="${wallet.wallet_id}">${wallet.name} - ${wallet.category} ($${wallet.balance})</option>`;
	});
	return options;
}

// Delete wallet button

const deleteWalletBtn = document.getElementById("wallet-delete-btn");

deleteWalletBtn.addEventListener("click", () => {
	const walletId = document.getElementById("wallet-delete").value;
	console.log(walletId);
	fetch(
		`http://localhost:8080/wallets/delete?user_id=${localStorage.getItem(
			"userId"
		)}&wallet_id=${walletId}`
	).then((response) => {
		if (response.status === 200) {
			window.location.href = "wallets.html";
			alert("Wallet deleted successfully");
		} else {
			alert("Error: " + response.status);
		}
	});
});

// Add new wallet

const addWalletBtn = document.getElementById("add-wallet-btn");

addWalletBtn.addEventListener("click", () => {
	const walletType = document.getElementById("wallet-type").value;
	const walletName = document.getElementById("wallet-name").value;
	const walletBalance = document.getElementById("wallet-balance").value;

	fetch(
		`http://localhost:8080/wallets/add?user_id=${localStorage.getItem(
			"userId"
		)}&category=${walletType}&name=${walletName}&balance=${walletBalance}`
	).then((response) => {
		if (response.status === 200) {
			window.location.href = "wallets.html";
			alert("Wallet added successfully");
		} else {
			alert("Error: " + response.status);
		}
	});
});
