// Generate options for delete
const host = "http://136.244.81.173:443";

fetch(`${host}/wallets?user_id=${localStorage.getItem("userId")}`).then(
	(response) => {
		response.json().then((wallets) => {
			document.getElementById("wallet-delete").innerHTML =
				renderDeleteOptionsHml(wallets);
		});
	}
);

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
		`${host}/delete?user_id=${localStorage.getItem(
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
		`${host}/wallets/add?user_id=${localStorage.getItem(
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
