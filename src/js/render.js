const buttonClose = document.querySelector('#close');
const buttonMaximize = document.querySelector('#maximize');
const buttonMinimize = document.querySelector('#minimize');

buttonClose.addEventListener('click', api.closeWindow)
buttonMaximize.addEventListener('click', api.maximizeWindow)
buttonMinimize.addEventListener('click', api.minimizeWindow)