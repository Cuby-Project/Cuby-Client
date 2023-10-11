const buttonClose = document.querySelector('#close');
const buttonMaximize = document.querySelector('#maximize');
const buttonMinimize = document.querySelector('#minimize');
const buttonGenerate = document.querySelector('#regenerate');

function refreshScramble() {
    api.generateScramble()
        .then(data => { console.log(data);
            const scramble = document.querySelector('#scramble');
            scramble.innerHTML = data;
        });
}

buttonClose.addEventListener('click', api.closeWindow)
buttonMaximize.addEventListener('click', api.maximizeWindow)
buttonMinimize.addEventListener('click', api.minimizeWindow)
buttonGenerate.addEventListener('click', refreshScramble)

refreshScramble();