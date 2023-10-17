let buttonDarkMode = document.querySelector('button#toggleDarkMode');

function toggleDarkMode() {
    document.html.classList.toggle('dark');
}

buttonDarkMode.addEventListener("click", toggleDarkMode);
