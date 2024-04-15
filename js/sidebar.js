const toggleButton = document.querySelector("#sidebar-toggle-btn");
const sidebar = document.querySelector("#sidebar");

let opened = false;

toggleButton.addEventListener("click", () => {
	sidebar.classList.toggle("-translate-x-80");
	opened = true;
});

window.addEventListener("click", (e) => {
	if (!e.target.closest("#sidebar") && opened && e.target !== toggleButton) {
		sidebar.classList.add("-translate-x-80");
		opened = false;
	}
});
