let buttonTheme = document.querySelector('button#toggleDarkMode');

function changeTheme() {
    appdata.getTheme().then(
        (theme => {
            if (theme === "dark") {
                buttonTheme.innerHTML = "change to dark Mode";
                document.querySelector("html").classList.remove('dark')
            } else {
                buttonTheme.innerHTML = "change to light Mode";
                document.querySelector("html").classList.add('dark')
            }
            appdata.changeTheme();
        })
    );
}

// Set theme on load of page
appdata.getTheme().then(
    (theme => {
        if (theme === "dark") {
            document.querySelector("html").classList.add('dark')
            buttonTheme.innerHTML = "change to light Mode";
        } else {
            document.querySelector("html").classList.remove('dark')
            buttonTheme.innerHTML = "change to dark Mode";
        }
    }
));

buttonTheme.addEventListener("click", changeTheme);
