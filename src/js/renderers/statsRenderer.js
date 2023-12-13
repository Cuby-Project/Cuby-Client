function changeChart(cube) {
    chartAPI.getChart(cube, document.getElementById('myChart'));
}

changeChart("3x3x3");

/*
document.getElementById('cube').addEventListener('change', function () {
    changeChart(this.value);
});
*/
