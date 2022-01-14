let id_usuario = getUserIdInLocalStorage(); // ID do usuário atual
let app_name; // Nome do app que é passado na URL
let app_version; // Versão atual do APP
let url_api; // Url da api
let system_url; // Url da aplicação WEB

function changeAppAmbient(test_or_prod) { //Função irá trocar automaticamente o ambiente do aplicativo conforme o parâmetro passado na função.
    const dev_name = ""; //Nome da aplicação em desenvolvimento.
    const production_name = "/cademint" //Nome da aplicação em produção.
    const dev_environment = "http://localhost:3000"; //Ambiente de desenvolvimento.
    const production_environment = "https://scrum-cademint-api.herokuapp.com"; //Ambiente de produção.
    const app_url_production = "https://saymon-felipe.github.io/cademint"; //Url do aplicativo web em produção
    const app_url_test = "http://127.0.0.1:5501"; //Url do aplicativo web em teste

    switch (test_or_prod) {
        case 0:
            app_name = dev_name;
            url_api = dev_environment;
            system_url = app_url_test;
            break;
        case 1: 
            app_name = production_name;
            url_api = production_environment;
            system_url = app_url_production;
            break;
    }
}


// TROCA DO AMBIENTE DA APLICAÇÃO
//
// O parâmetro que deverá ser informado será 0 ou 1, sendo que:
// 0 - Ambiente de teste
// 1 - Ambiente de produção
// 
// ==============================
   changeAppAmbient(1);
// ==============================
//
// ALIMENTAÇÃO DA VERSÃO
   app_version = "v " + "1.0.10";
//
//

// INÍCIO DA APLICAÇÃO
let login_url = new URL(window.location);
let enter_group_url = login_url.searchParams.get("joined_group");

function getUserIdInLocalStorage() { //Pega o id do usuário logado que está armazenado em session storage.
    let user_id = localStorage.getItem("user_id");
    return user_id;
}

function removeUserIdInLocalStorage() { //Pega o id do usuário logado que está armazenado em session storage.
    localStorage.removeItem("user_id");
}

function getJwtFromLocalStorage() { //Pega o token jwt que está armazenado no session storage caso o usuário estiver logado.
    return localStorage.getItem("jwt_token");
}

function removeJwtFromLocalStorage(from_login = "") { //Remove o token JWT de session storage e envia para o login passando parametro na URL.
    localStorage.removeItem("jwt_token");

    if (from_login == "from_login") {
        login_url.searchParams.append("msg", "time-out");
    } else if (from_login == "from_maintenance") {
        return;
    }

    window.location.href = login_url;
}

function removeCurrentProjectIdInSessionStorage() {
    sessionStorage.removeItem("current_group_id");
}

function removeOsListFromSessionStorage() {
    sessionStorage.removeItem("os_list");
}

function systemInMaintenance() { // Função checka se o sistema está em manutenção, se estiver redireciona para a página de manutenção.
    let inMaintenance = false;

    $.ajax({ 
        url: url_api + "/system/maintenance",
        type: "GET",
        async: false,
        success: (res) => {
            if (res.response.in_maintenance) {
                inMaintenance = true;
            }
        }
    }); 

    return inMaintenance;
}

function checkIfUserIsAuthenticated() { // Função testará se usuário está logado para permitir sua entrada na página.
    if (systemInMaintenance()) {
        removeOsListFromSessionStorage();
        removeJwtFromLocalStorage("from_maintenance");
        removeUserIdInLocalStorage();

        if (window.location.pathname != app_name + "/maintenance.html") {
            if (getJwtFromLocalStorage() == null) {
                window.location.pathname = app_name + "/maintenance.html";
            } else {
                $(".in-maintenance-element").show();
            }
        } else {
            setTimeout(checkIfUserIsAuthenticated, 60 * 1000); // Se o sistema estiver em manutenção e cair na página de manutenção, depois de 60 segundos é feita uma nova verificação.
        }
    } else {
        let jwt = "Bearer " + getJwtFromLocalStorage();
        if (jwt == "Bearer null") { 
            if (window.location.pathname != app_name + "/login.html" && window.location.pathname != app_name + "/register.html" && window.location.pathname != app_name + "/enter_group_invitation.html") { // Se o usuário não estiver na página de login ou register, ele é redirecionado.
                window.location.pathname = app_name + "/login.html";
            }
        } else {
            $.ajax({ // Se ja estiver logado no sistema e acessar a página de login, é checkado a valia do token JWT e então redirecionado para a index.
                url: url_api + "/usuarios/checkJWT",
                type: "POST",
                async: false,
                headers: {
                    Authorization: jwt
                },
                data: {
                    id: getUserIdInLocalStorage()
                },
                success: () => {
                    if (window.location.pathname == "/login.html") { // Se o usuário estiver logado e entrar em login, o mesmo é logado novamente e direcionado para a index.
                        setTimeout(() => {
                            $(".form-input").attr("disabled", true);
                            $("#submit-button").attr("disabled", true);
                            $(".loading").show();

                            setTimeout(() => {
                                window.location.pathname = app_name + "/index.html";
                            }, 1000);
                        }, 100);
                    }
                },
                error() { // Caso contrário ele é deslogado e enviado para login.
                    removeCurrentProjectIdInSessionStorage();
                    removeOsListFromSessionStorage();

                    if (window.location.pathname != app_name + "/login.html" && window.location.pathname != app_name + "/maintenance.html") {
                        removeJwtFromLocalStorage("from_login");
                    } else {
                        removeUserIdInLocalStorage();
                        removeJwtFromLocalStorage();
                    }
                },
                complete: () => {
                    if (window.location.pathname != app_name + "/login.html" && window.location.pathname != app_name + "/register.html") {
                        setTimeout(checkIfUserIsAuthenticated, 10000);
                    }
                }
            }); 
        }
    }
}

checkIfUserIsAuthenticated() // Início da função para checkar se o usuário está online.