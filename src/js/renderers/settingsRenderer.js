let buttonDarkMode = document.querySelector('button#toggleDarkMode');

function toggleDarkMode() {
    document.querySelector("html").classList.toggle('dark');
}

buttonDarkMode.addEventListener("click", toggleDarkMode);
