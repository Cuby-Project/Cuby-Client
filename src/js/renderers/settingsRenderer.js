let buttonTheme = document.querySelector('button#toggleDarkMode');

function changeTheme() {
    appdata.getTheme().then(
        (theme => {
            document.querySelector("html").classList.toggle('dark');
            if (theme === "dark") {
                buttonTheme.innerHTML = "change to light Mode";
            } else {
                buttonTheme.innerHTML = "change to dark Mode";
            }
            appdata.changeTheme();
        })
    );
}

// Set theme on load of page
appdata.getTheme().then(
    (theme => {
        if (theme === "dark") {
            document.querySelector("html").classList.toggle('dark');
            buttonTheme.innerHTML = "change to light Mode";
        } else {
            buttonTheme.innerHTML = "change to dark Mode";
        }
    }
));

buttonTheme.addEventListener("click", changeTheme);
