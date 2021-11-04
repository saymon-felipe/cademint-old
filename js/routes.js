let id_usuario = getUserIdInSessionStorage();
let app_name;
let url_api;

// FUNÇÃO PARA TROCAR O AMBIENTE DA APLICAÇÃO
//
// Primeiro parâmetro será 0 ou 1, sendo que:
// 0 - Ambiente de teste
// 1 - Ambiente de produção
// 
// ==============================
   changeAppAmbient(1);
// ==============================

function getUserIdInSessionStorage() {
    let user_id = sessionStorage.getItem("user_id");
    return user_id;
}

function getJwtFromSessionStorage() {
    let jwt = sessionStorage.getItem("jwt_token");
    if (jwt == undefined) { return; }
    return jwt;
}

function changeAppAmbient(test_or_prod) {
    const dev_name = ""; //Nome da aplicação em desenvolvimento
    const production_name = "/scrum-cademint" //Nome da aplicação em produção
    const dev_environment = "http://localhost:3000"; //Ambiente de desenvolvimento
    const production_environment = "https://scrum-cademint-api.herokuapp.com"; //Ambiente de produção

    switch (test_or_prod) {
        case 0:
            app_name = dev_name;
            url_api = dev_environment;
            break;
        case 1: 
            app_name = production_name;
            url_api = production_environment;
            break;
    }
}

//Função testará se usuário está logado para permitir sua entrada na página
function checkIfUserIsAuthenticated() {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (jwt == "Bearer undefined") { 
        if (window.location.pathname == app_name + "/login.html" || window.location.pathname == app_name + "/register.html") { return; };
        console.log(app_name)
        window.location.pathname = app_name + "/login.html";
    } else {
        if (window.location.pathname == app_name + "/login.html") {
            $.ajax({
                url: url_api + "/usuarios/checkJWT/" + id_usuario,
                type: "GET",
                headers: {
                    Authorization: jwt
                },
                success: (res) => {
                    $(".form-input").attr("disabled", true);
                    $("#submit-button").attr("disabled", true);
                    $(".loading").show();
                    setTimeout(() => {
                        window.location.pathname = app_name + "/index.html";
                    }, 2000);
                },
                error(xhr,status,error) {
                    removeJwtFromSessionStorage();
                }
            });
        }
    }
}

/*function checkCurrentUrl() {
    let url = window.location.pathname;
    if (!url === "/index.html" || !url === "/os-editar.html" || !url === "/login.html") {
        window.location.pathname = "/not-found.html"
    }
}*/
checkIfUserIsAuthenticated();
setInterval(() => {
    checkIfUserIsAuthenticated();
}, 1000);