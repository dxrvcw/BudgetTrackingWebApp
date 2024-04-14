const signOutBtn = document.getElementById("sign-out-button");

signOutBtn.addEventListener("click", signOut);

function signOut() {
	localStorage.removeItem("userId");
	window.location.href = "index.html";
}
