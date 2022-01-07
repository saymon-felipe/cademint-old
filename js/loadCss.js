function fillCssFile() {
    
    setTimeout(() => {
        let css = `<link rel="stylesheet" href="css/style.css?v=${app_version.replace("v ", "").replace(".", "_").replace(".", "_")}"></link>`
        $("head").append(css);
    }, 100);

}

fillCssFile();