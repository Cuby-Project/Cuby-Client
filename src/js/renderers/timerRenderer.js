const buttonGenerate = document.querySelector('#regenerate');
const buttonDisplayScramble = document.querySelector("#displayScramble");
const previewIcon = document.querySelector("#previewIcon");
const previewScramble = document.querySelector("#previewScramble");
const scramble = document.querySelector('#scramble');
const selectCube = document.querySelector('#selectCube');
const previewContainer = document.querySelector('#previewContainer');

const cubes = {
    "2x2": "2x2x2",
    "3x3": "3x3x3",
    "4x4": "4x4x4",
    "5x5": "5x5x5",
    "6x6": "6x6x6",
    "7x7": "7x7x7",
    "square-one": "square1",
    "pyraminx": "pyraminx",
    "skewb": "skewb",
    "megaminx": "megaminx"
}

function refreshScramble() {
    api.generateScramble()
        .then(data => {
            scramble.innerHTML = data;
        });
    //displayPreview()
}

function generatePreview(puzzle, alg) {
    let preview = "<twisty-player class='h-44 w-[15rem]'";
    preview += "alg=\"" + alg + "\" puzzle='";
    preview += puzzle + "' hint-facelets='none' back-view='none' control-panel='none' background='none' ></twisty-player>";
    return preview;
}

function displayPreview() {
    if (previewIcon.classList.contains("fa-eye")) {
        previewContainer.classList.remove("hidden");
        previewIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        previewContainer.classList.add("hidden");
        previewIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
    console.log(previewIcon.classList)
    let alg = scramble.innerHTML;
    let puzzle = selectCube.value ;
    previewScramble.innerHTML = generatePreview(cubes[puzzle], alg);
}

buttonGenerate.addEventListener('click', refreshScramble)
refreshScramble();

buttonDisplayScramble.addEventListener('click', displayPreview)
selectCube.addEventListener("change", displayPreview)
