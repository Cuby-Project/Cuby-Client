const buttonClose = document.querySelector('#close');
const buttonMaximize = document.querySelector('#maximize');
const buttonMinimize = document.querySelector('#minimize');

buttonClose.addEventListener('click', api.closeWindow)
buttonMaximize.addEventListener('click', api.maximizeWindow)
buttonMinimize.addEventListener('click', api.minimizeWindow)

appdata.getTheme().then(
    (theme => {
        if (theme === "dark") {
            document.querySelector("html").classList.toggle('dark');
        }
    }));