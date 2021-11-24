function findDate() {
    let date = new Date();
    let month = date.getMonth();
    let day = date.getDate();
    let year = date.getFullYear();
    
    // Variavel para fazer a troca pontual dos aquivos JS e CSS
    let version = 1;

    if (day == 1 || day == 4 || day == 7 || day == 10 || day == 13 || day == 16 || day == 19 || day == 22 || day == 25 || day == 28 || day == 31) {
        return `${year}-${month}-${day}-v${version}`;
    }
    
    return `${year}-${month}-v${version}`;
}

function fillJsFile() {
    let css = `<link rel="stylesheet" href="css/style.css?v=${findDate()}"></link>`
    $("head").append(css);
}

fillJsFile();