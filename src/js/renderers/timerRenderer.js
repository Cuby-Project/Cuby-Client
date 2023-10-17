const buttonGenerate = document.querySelector('#regenerate');

function refreshScramble() {
    api.generateScramble()
        .then(data => {
            const scramble = document.querySelector('#scramble');
            scramble.innerHTML = data;
        });
}

buttonGenerate.addEventListener('click', refreshScramble)

refreshScramble();