const url_api = "https://scrum-cademint-api.herokuapp.com"; //Ambiente de Teste = http://localhost:3000
                                         //Ambiente de Produção = https://scrum-cademint-api.herokuapp.com

let app_name = "/scrum-cademint"; // /scrum-cademint (PRODUÇÃO);
                   // "" (TESTE); 

//Início da execução.
if($(document).length) {
    fillUserImage();
    loadOs();
    checkIfJwtIsValid();

    setInterval(() => {
        loadOs();
    }, 1000);

    setInterval(() => {
        checkIfJwtIsValid();
        fillUserImage();
    }, 60000);

    //Funções do menu
    $(".go-to-user-profile-inner").on("click", () => {
        $(".profile-more-options-container").toggleClass("opacity-1");
        $("#profile-more-options").toggleClass("rotate");
    });
};

//Função para preencher a imagem do usuário logado
function fillUserImage() {
    let id_usuario = getUserIdInSessionStorage();
    if (id_usuario == null) {
        return;
    }
    $.ajax({
        url: url_api + "/usuarios/" + id_usuario,
        type: "GET",
        success: (res) => {
            $(".user-name").html(res.response.nome);
            if (res.response.profile_photo == "") {
                res.response.profile_photo = url_api + "/public/default-user-image.png";
            }
            $(".avatar-header").attr("src", res.response.profile_photo);
        }
    });
}

//Função para checkar se o JWT é valido, se não faz uma nova requisição
function checkIfJwtIsValid() {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (jwt == "Bearer undefined") { return; };
    let id_usuario = getUserIdInSessionStorage();
    if (window.location.pathname == app_name + "/login.html") { return; };
    $.ajax({
        url: url_api + "/usuarios/checkJWT/" + id_usuario,
        type: "GET",
        headers: {
            Authorization: jwt
        },
        success: (res) => {
            return;
        },
        error(xhr,status,error) {
            removeJwtFromSessionStorage();
        }
    });
}

//Função para gerar número de OS com base no ano e no mês, além do próprio id da OS em banco.
function generateNumberOs(number) {
    let date = new Date();
    let year = date.getFullYear().toString().slice(-2);
    let month = date.getMonth() + 1;
    let numberOs = "";
    if (month < 10) {
        month = "0" + month;
    }
    if (number < 10) {
        numberOs = `0${number}`;
    } else {
        numberOs = number;
    }
    let newId = parseInt(`${year}${month}${numberOs}`);
    return newId;
};

//Função para resetar os campos do SCRUM.
function resetOsFields(field1, field2, field3, field4) {
    $(field1).html("");
    $(field2).html("");
    $(field3).html("");
    $(field4).html("");
};

//Função para encontrar a OS solicitada pelo ID.
function findOS(id) {
    let mainArrayOs = getAllOs();
    for (let i in mainArrayOs) {
        if (mainArrayOs[i].id_complete == id) {
            return mainArrayOs[i];
        };
    };
};

//Função para encontrar as classes segundo a prioridade da OS.
function findPriority(priority, badge = 0) {
    switch (priority) {
        case 1: 
            if (badge == 1) { return "normal" };
            return "Normal";
        case 2: 
            if (badge == 1) { return "priority" };
            return "Prioritário";
    };
};

//Função armazena as OS recuperadas do banco de dados em localStorage para consulta.
function setOsInLocalStorage(object) {
    let arrayOsJson = JSON.parse(JSON.stringify(object));
    let arrayOs = JSON.stringify(arrayOsJson);
    if (localStorage.getItem("all_os")) {
        localStorage.removeItem("all_os");
        localStorage.setItem("all_os", arrayOs);
        return;
    }
    localStorage.setItem("all_os", arrayOs);
    return;
};

//Função recupera as OS do banco de dados.
function getAllOs() {
    $.ajax({
        url: url_api + "/os",
        type: "GET",
        success: (res) => {
            setOsInLocalStorage(res.response.os_list);
        }
    });
    let arrayOsJson = localStorage.getItem("all_os");
    let mainArrayOs = JSON.parse(arrayOsJson);
    if (mainArrayOs == null) {
        mainArrayOs = [];
    }
    return mainArrayOs;
};

//Função aloca as OS conforme status no KANBAM.
function loadOs() {
    let mainArrayOs = getAllOs();
    resetOsFields("#col-to-do .os-list", "#col-doing .os-list", "#col-test .os-list", "#col-done .os-list");
    if (!mainArrayOs.length == 0) {
        for (let i in mainArrayOs) {
            let card = `<a href="os-editar.html?id=${mainArrayOs[i].id_complete}&s=0" class="card-link">
                            <div class="card-os" id=${mainArrayOs[i].id_complete}>
                                <div class="card-os-header">
                                    <h6>(OS) ${mainArrayOs[i].id_complete}</h6>
                                    <h6 class="sponsor-card-name">${mainArrayOs[i].sponsor}</h6>
                                </div>
                                <div class="card-os-body">
                                    <p class="os-description">
                                        ${mainArrayOs[i].desc_os}
                                    </p>
                                    <div class="text-elipsis">...</div>
                                </div>
                                
                                <div class="priority-container ${findPriority(mainArrayOs[i].priority, 1)}">
                                    <h6 class="priority-text">${findPriority(mainArrayOs[i].priority)}</h6>
                                </div>
                            </div>
                        </a>`;

            switch (mainArrayOs[i].status_os) {
                case 1:
                    $("#col-to-do .os-list").append(card);
                    break;
                case 2:
                    $("#col-doing .os-list").append(card);
                    break;
                case 3: 
                    $("#col-test .os-list").append(card);
                    break;
                case 4:
                    $("#col-done .os-list").append(card);
                    break;
            };

            if (mainArrayOs[i].desc_os.length > 162) {
                $("#" + mainArrayOs[i].id_complete + " .text-elipsis").show();
            };
        };
    };

    var url = "https://saymon-felipe.github.io/scrum-cademint/" // https://saymon-felipe.github.io/scrum-cademint/ (PRODUÇÃO)
             // http://127.0.0.1:5500/ (TESTE)

    //Vai para a tela de criar nova OS com status A FAZER.
    $("#new-os-1").on("click", () => {
        var url_os = new URL(url + "os-editar.html");
        url_os.searchParams.append("s", 1);
        window.location.href = url_os;
    });

    //Vai para a tela de criar nova OS com status FAZENDO.
    $("#new-os-2").on("click", () => {
        var url_os = new URL(url + "os-editar.html");
        url_os.searchParams.append("s", 2);
        window.location.href = url_os;
    });
};

//Função exclui a OS solicitada através do ID.
function excludeOs(param) {
    let currentOs = findOS(param);
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (currentOs == undefined) {
        $(".response").html("Não é possível excluir uma OS que não existe ainda!");
    } else {
        $.ajax({
            url: url_api + "/os/" + param,
            headers: {
                Authorization: jwt
            },
            type: "DELETE",
            success: (res) => {
                window.location.pathname = app_name + "/index.html";
            }
        });
    };
};

//Função salva uma OS já existente através do ID.
function saveOs(os_number, priority, status, description, sponsor, source) {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (source > 2000) {
        return;
    };
    $.ajax({
        url: url_api + "/os",
        headers: {
            Authorization: jwt
        },
        type: "PATCH",
        data: {
            desc_os: description,
            status_os: status,
            priority: priority,
            id_complete: os_number,
            sponsor: sponsor
        },
        success: (res) => {
            window.location.pathname = app_name + "/index.html";
        }
    });
};

//Função cria o ID completo conforme o ID da OS retornada do banco e faz UPDATE da respectiva linha na tabela.
function fillIdComplete(id_raw) {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    $.ajax({
        url: url_api + "/os/id_complete",
        headers: {
            Authorization: jwt
        },
        type: "PATCH",
        data: {
            id_complete: generateNumberOs(id_raw),
            id_raw: id_raw
        },
        success: (res) => {
            window.location.pathname = app_name + "/index.html";
        }
    });
};

//Função cria uma nova OS enviando dados dos inputs para o banco de dados.
function createOs(priority, status, description, sponsor, source) {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (source > 2000) {
        return;
    };
    $.ajax({
        url: url_api + "/os",
        headers: {
            Authorization: jwt
        },
        type: "POST",
        data: {
            desc_os: description,
            status_os: status,
            priority: priority,
            sponsor: sponsor
        },
        success: (res) => {
            fillIdComplete(res.os_criada.id_os);
        }
    });
};

function countCharacters(source, target, response) {
    let characters = $(source).val();
    let stringLength = characters.length;
    if(stringLength > 2000) {
        $(target).addClass("max-length");
        $(response).show();
    } else {
        $(target).removeClass("max-length");
        $(response).hide();
    }
    $(target).html(`${characters.length} / 2000 caracteres.`);
}

//Funções que rodam a partir do momento que entra na tela 'os-editar.html'.
if ($(".edit-os").length) {

    let responsavel = $("#sponsor");
    let nomes = [];
    
    $.ajax({
        url: url_api + "/usuarios",
        type: "GET",
        success: (res) => {
            for (let i in res.response.lista_de_usuarios) {
                nomes.push(`<option value="${res.response.lista_de_usuarios[i].nome}">${res.response.lista_de_usuarios[i].nome}</option>`);
                responsavel.append(nomes[i])
            }
        }
    });

    let url = window.location.href;
    let paramValue1 = "";
    let paramValue2 = "";
    let param1excluded;
    let currentOs;
    let param1 = url.split("?");
    if (param1[1].indexOf("i") != -1) {
        param1excluded = param1[1].split("&");
        paramValue1 = param1excluded[0].replace("id=", "");
        paramValue2 = param1excluded[1].replace("s=", "");
        currentOs = findOS(paramValue1);
    } else {
        paramValue2 = param1[1].replace("s=", "");
    };
    if (paramValue1 != undefined) {
        $("#so-number").val(paramValue1);
    };
    if (currentOs != undefined) {
        setTimeout(() => {
            console.log(currentOs.sponsor)
            $("#sponsor").val(currentOs.sponsor);
        }, 300);
        $("#status").val(currentOs.status_os);
        $("#priority").val(currentOs.priority);
        $("#description").val(currentOs.desc_os);
        
    } else {
        $("#status").val(paramValue2);
    };

    countCharacters("#description", ".count-characters", ".characters-response");
    $("#description").on("keyup", () => {
        countCharacters("#description", ".count-characters", ".characters-response");
    });

    $("#cancel-operation").on("click", (e) => {
        window.location.pathname = app_name + "/index.html";
    });

    $("#exclude-os").on("click", (e) => {
        if (currentOs == undefined) {
            $(".response").html("Não é possível excluir uma OS que não existe!");
        }
        excludeOs(paramValue1);
    });

    $("#save-os").on("click", () => {
        let os_number = $("#so-number").val();
        let priority = $("#priority").val();
        let status = $("#status").val();
        let description = $("#description").val();
        let sponsor = $("#sponsor").val();
        let source = $("#description").val().length;
        if (priority == "" || status == "" || description == "" || sponsor == "-- Nome --") {
            $(".response").html("Não foi possível salvar a OS, campos vazios.");
        } else {
            $(".response").html("");
            if (currentOs != undefined) {
                saveOs(os_number, priority, status, description, sponsor, source);
            } else {
                createOs(priority, status, description, sponsor, source);
            }
        };
    });
};

//Funções para tela de login
if ($(".login").length) {
    let currentEmail = $("#user").val();
    let email = getEmailInLocalStorage();
    if (email != undefined) {
        fillEmail(email);
    };
    $("#user").on("keyup", () => {
        showRemember(email, currentEmail);
    });
    $("#login-form").on("submit", (e) => {
        e.preventDefault();
        
        let data = $("#login-form").serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        if (data['remember'] == 'on') { setEmailInLocalStorage(data['email']); }

        $("#login-form").find(".form-input").attr("disabled", true);
        $("#login-form").find(".loading").show();
        $("#login-form").find('.response').hide();
        
        $.ajax({
            url: url_api + "/usuarios/login",
            type: "POST",
            data: data,
            success: (res) => {
                setJwtInSessionStorage(res.token);
                setUserIdInSessionStorage(res.id_usuario);
                window.location.pathname = app_name + "/index.html"
            },
            error: (xhr) => {
                let error;
                if (xhr.responseJSON != undefined) {
                    error = xhr.responseJSON.mensagem;
                } else {
                    error = "Erro";
                }
                $("#login-form").find('.response').html(error);
                $("#login-form").find('.response').show();
                $("#login-form").find(".loading").hide();
            },
            complete: () => {
                $("#login-form").find('.form-input').attr('disabled', false);
                $("#login-form").find(".loading").hide();
            }
        });
    });
}

function setUserIdInSessionStorage(id_usuario) {
    sessionStorage.setItem("user_id", id_usuario);
}

function getUserIdInSessionStorage() {
    let user_id = sessionStorage.getItem("user_id");
    return user_id;
}

//Função para deslogar usuário
function logoutUser() {
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user_id");
    window.location.pathname = app_name + "/login.html"
}

function setEmailInLocalStorage(email) {
    let varEmail = getEmailInLocalStorage();
    if (varEmail != undefined) {
        localStorage.removeItem("e-mail");
        localStorage.setItem("e-mail", email);
        return;
    }
    localStorage.setItem("e-mail", email);
    return;
}

function getEmailInLocalStorage() {
    let email = localStorage.getItem('e-mail');
    if (email == undefined) { return; }
    return email;
}

function fillEmail(email) {
    $("#login-form").find("#user").val(email);
}

function showRemember(email1, email2) {
    if (email1 == email2) { return; };
    $(".remember").css("display", "flex");
    return;
}

function getJwtFromSessionStorage() {
    let jwt = sessionStorage.getItem("jwt_token");
    if (jwt == undefined) { return; }
    return jwt;
}

function setJwtInSessionStorage(token) {
    if (sessionStorage.getItem("jwt_token")) {
        sessionStorage.removeItem("jwt_token");
        sessionStorage.setItem("jwt_token", token);
        return;
    }
    sessionStorage.setItem("jwt_token", token);
    return;
}

function removeJwtFromSessionStorage() {
    sessionStorage.removeItem("jwt_token");
}

//Funções para tela de registro
if ($(".register").length) {
    $("#register-form").on("submit", (e) => {
        e.preventDefault();
        
        let data = $("#register-form").serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        $("#register-form").find(".form-input").attr("disabled", true);
        $("#register-form").find(".loading").show();
        
        $.ajax({
            url: url_api + "/usuarios/cadastro",
            type: "POST",
            data: data,
            success: () => {
                $("#register-form").find(".response").addClass("success");
                $("#register-form").find(".response").html("Usuário cadastrado!");
                $("#register-form").find(".response").show();
                window.location.pathname = app_name + "/login.html";
            },
            error: (xhr) => {
                let error;
                if (xhr.responseJSON != undefined) {
                    error = xhr.responseJSON.mensagem;
                } else {
                    error = "Erro";
                }
                $("#register-form").find('.response').html(error);
                $("#register-form").find('.response').show();
                $("#register-form").find(".loading").hide();
            },
            complete: () => {
                $("#register-form").find('.form-input').attr('disabled', false);
                $("#register-form").find(".loading").hide();
            }
        });
    });
};

//Função para fechar modal de envio da imagem
function closeImageModal() {
    $(".upload").css("transform", "translateY(-100vh)");
    setTimeout(() => {
        $(".upload").hide();
        $(".overlay").hide();
    }, 400);

    $(".photo-detail-container").css("transform", "translateY(-100vh)");
    setTimeout(() => {
        $(".photo-detail-container").hide();
        $(".overlay").hide();
    }, 400);
}

//Funções para tela de alteração do perfil
if ($(".update-profile").length) {
    let id_usuario = getUserIdInSessionStorage();
    fillInformations("#nome", ".user-photo-inner", "#user-image", id_usuario);
    
    $(".user-photo").on("mouseover", () => {
        if ($("#user-image").is(":visible")) {
            $(".delete-image").css("transform", "translateY(0)");
        };
    });
    $(".user-photo").on("mouseout", () => {
        if ($("#user-image").is(":visible")) {
            $(".delete-image").css("transform", "translateY(30px)");
        };
    });
    $(".delete-image").on("click", () => {
        removeImage(id_usuario);
    });
    $(".user-photo-container").on("click", () => {
        togglePhotoOptions(".photo-options");
    });
    
    $(".show-photo").on("click", () => {
        $(".photo-detail-container").show();
        $(".overlay").show();
        setTimeout(() => {
            $(".photo-detail-container").css("transform", "translateY(0)");
        }, 10);
        requireImage(id_usuario);
    });
    $(".upload-photo").on("click", () => {
        sendPhoto();
    });

    $(".overlay").on("click", () => {
        closeImageModal();
    });

    $("#nome").on("keyup", () => {
        $("#update-profile-button").show();
    });

    $("#update-profile-button").on("click", () => {
        let name = $("#nome").val();
        let jwt = "Bearer " + getJwtFromSessionStorage();
        $.ajax({
            url: url_api + "/usuarios/update_name/" + id_usuario,
            type: "PATCH",
            headers: {
                Authorization: jwt
            },
            data: {
                nome: name
            },
            success: (res) => {
                location.reload();
            }
        });
    });

    $("#photo").on("change", (e) => {
        $(".response").html("");
        let filePath = $("#photo").val();
        let fileSplited = filePath.split('\\');
        let fileName = fileSplited[fileSplited.length - 1];
        $('.file-name').html(fileName);
        if (fileName != undefined) {
            $("#send-photo-button").show();
        };

        let file = e.target.files.item(0);
        let adress = new FileReader();
        let formData = new FormData();
        formData.append("user_imagem", file);
        
        adress.onloadend = () => {
            $(".image-preview").attr("src", adress.result);
            $(".photo-preview").css("display", "flex");
        };
        adress.readAsDataURL(file);

        $("#send-photo-button").on("click", () => {
            uploadPhoto(id_usuario, formData);
        });
    });
};

function fillInformations(element1, element2, element3, user_id) {
    $.ajax({
        url: url_api + "/usuarios/" + user_id,
        type: "GET",
        success: (res) => {
            if (!res.response.profile_photo == "") {
                $(element2).html("");
                $("#user-image").show();
                $(".show-photo").show();
                $(element3).attr("src", res.response.profile_photo);
            }
            $(element1).val(res.response.nome);
        }
    });
};

function togglePhotoOptions(element) {
    if ($(element).is(":visible")) {
        $(element).css("display", "none");
    } else {
        $(element).css("display", "flex");
    }  
};

function uploadPhoto(id, formData) {
    $(".response").html("");
    let jwt = "Bearer " + getJwtFromSessionStorage();
    $(".loading").show();
    $.ajax({
        url: url_api + "/usuarios/" + id,
        headers: {
            Authorization: jwt
        },
        processData: false,
        contentType: false,
        type: "PATCH",
        data: formData,
        success: (res) => {
            closeImageModal();
            togglePhotoOptions(".photo-options");
            $(".loading").show();
            location.reload();
        },
        error: (error) => {
            $(".loading").hide();
            $(".response").html(error.responseJSON.error);
        }
    });
}

function sendPhoto() {
    $(".upload").show();
    setTimeout(() => {
        $(".upload").css("transform", "translateY(0)");
    }, 10);
    
    $(".overlay").show();
}

function requireImage(id_usuario) {
    $.ajax({
        url: url_api + "/usuarios/" + id_usuario,
        type: "GET",
        success: (res) => {
            $(".photo-detail").attr("src", res.response.profile_photo);
            togglePhotoOptions(".photo-options");
        }
    });
};

function removeImage(id_usuario) {
    let jwt = "Bearer " + getJwtFromSessionStorage();
    $.ajax({
        url: url_api + "/usuarios/remove_image/" + id_usuario,
        type: "PATCH",
        headers: {
            Authorization: jwt
        },
        success: (res) => {
            location.reload();
        }
    });
}

