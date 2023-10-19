// Set theme on load of page
appdata.getTheme().then(
    (theme => {
            if (theme === "dark") {
                document.querySelector("html").classList.add('dark')
            } else {
                document.querySelector("html").classList.remove('dark')
            }
        }
    ));