function fillJsFile() {
    setTimeout(() => {
        let js = `<script src="js/app.js?v=${app_version.replace("v ", "").replace(".", "_").replace(".", "_")}"></script>`
        $("#scripts").append(js);
    });
}

fillJsFile();