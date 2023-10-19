const buttonClose = document.querySelector('#close');
const buttonMaximize = document.querySelector('#maximize');
const buttonMinimize = document.querySelector('#minimize');

buttonClose.addEventListener('click', api.closeWindow)
buttonMaximize.addEventListener('click', api.maximizeWindow)
buttonMinimize.addEventListener('click', api.minimizeWindow)

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