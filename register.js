const host = "http://136.244.81.173:443";

let emailLabel = document.getElementById("email");
let passwordLabel = document.getElementById("password");
let repeatPasswordLabel = document.getElementById("repeatPassword");
let submitButton = document.getElementById("submit");

if (localStorage.getItem("userId")) {
	window.location.href = "app.html";
}

submitButton.addEventListener("click", register);

function register() {
	let email = emailLabel.value;
	let password = passwordLabel.value;
	let repeatPassword = repeatPasswordLabel.value;

	if (validateEmail(email) && validatePassword(password, repeatPassword)) {
		fetch(`${host}/register?login=${email}&password=${password}`).then(
			(response) => {
				if (response.status !== 200) {
					alert("Error: " + response.status);
				} else {
					window.location.href = "login.html";
				}
			}
		);
	}
}

function validateEmail(email) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		return true;
	}
	alert("You have entered an invalid email address!");
	return false;
}

function validatePassword(password, secondPassword) {
	if (password === secondPassword && password.length >= 8) {
		return true;
	}
	alert("Passwords do not match or are too short!");
	return false;
}
