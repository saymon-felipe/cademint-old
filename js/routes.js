
let id_usuario = getUserIdInSessionStorage();

let app_name = "/scrum-cademint";

function getUserIdInSessionStorage() {
    let user_id = sessionStorage.getItem("user_id");
    return user_id;
}

function getJwtFromSessionStorage() {
    let jwt = sessionStorage.getItem("jwt_token");
    if (jwt == undefined) { return; }
    return jwt;
}

//Função testará se usuário está logado para permitir sua entrada na página
function checkIfUserIsAuthenticated() {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (jwt == "Bearer undefined") { 
        if (window.location.pathname == "/scrum-cademint/login.html" || window.location.pathname == "/scrum-cademint/register.html") { return; };
        window.location.pathname = app_name + "/login.html";
    } else {
        let id_usuario = getUserIdInSessionStorage();
        if (window.location.pathname == "/scrum-cademint/login.html") {
            const url_api = "https://scrum-cademint-api.herokuapp.com";
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

function checkCurrentUrl() {
    let url = window.location.pathname;
    if (!url === "/index.html" || !url === "/os-editar.html" || !url === "/login.html") {
        window.location.pathname = "/not-found.html"
    }
}
checkIfUserIsAuthenticated();
setInterval(() => {
    checkIfUserIsAuthenticated();
}, 1000);