const host = "http://136.244.81.173:443";

let emailLabel = document.getElementById("email");
let passwordLabel = document.getElementById("password");
let submitButton = document.getElementById("submit");

if (localStorage.getItem("userId")) {
	window.location.href = "app.html";
}

submitButton.addEventListener("click", login);

function login() {
	let email = emailLabel.value;
	let password = passwordLabel.value;

	fetch(`${host}/login?login=${email}&password=${password}`).then(
		(response) => {
			if (response.status === 401) {
				alert("Wrong email or password");
			} else if (response.status !== 200) {
				alert("Error: " + response.status);
			} else {
				window.location.href = "app.html";

				response.json().then((data) => {
					localStorage.setItem("userId", data.userId);
					localStorage.setItem("email", data.email);
				});
			}
		}
	);
}
