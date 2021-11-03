
let id_usuario = getUserIdInSessionStorage();

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
        if (window.location.pathname == "/login.html" || window.location.pathname == "/register.html") { return; };
        window.location.href = "/login.html";
    } else {
        let id_usuario = getUserIdInSessionStorage();
        const url_api = "http://localhost:3000";
        if (window.location.pathname == "/login.html") {
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
                        window.location.href = "/index.html";
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