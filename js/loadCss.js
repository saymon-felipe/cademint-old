function fillCssFile() {
    let css = `<link rel="stylesheet" href="css/style.css?v=${app_version.replace("v ", "").replace(".", "_").replace(".", "_")}"></link>`
    $("head").append(css);
}

fillCssFile();