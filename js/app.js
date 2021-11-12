let app_version;
let system_url;
let in_drag = false;

function changeAppVersionAndUrl(ambient, version) { //Função irá trocar automaticamente o ambiente do aplicativo conforme o parâmetro passado na função e a versão também.
    const app_url_production = "https://saymon-felipe.github.io/scrum-cademint/";
    const app_url_test = "http://127.0.0.1:5500/";
    switch (ambient) {
        case 0:
            system_url = app_url_test;
            break;
        case 1:
            system_url = app_url_production;
            break;
    }
    app_version = "v " + version;
}

// FUNÇÃO PARA ATUALIZAR A VERSÃO DO APP
//
// O primeiro parâmetro se refere ao ambiente do app, preencha 0 para Teste e 1 para PRODUÇÃO
// 
// O parâmetro que será informado será versão do aplicativo que vai para o ar (deve ser trocada antes de cada commit).
// O formato deve ser x.x.x e incremental (explicação abaixo).
//
// A unidade refere-se à alterações pequenas que não tem grande impacto sobre a usabilidade do produto.
// A dezena refere-se à alterações médias que tem um impacto significativo na usabilidade do produto.
// A centena refere-se à alterações grandes na usabilidade e no conceito em geral.
//
// ==============================
   changeAppVersionAndUrl(1, "0.2.2");
// ==============================

if($(document).length) { //Início da execução.
    if (window.location.pathname != app_name + "/login.html") { //Se cair aqui significa que o usuário não está na tela de login e as funções deverão ser executadas.
        fillUserImage(); //Carrega imagem do usuário.
        checkIfJwtIsValid(); //Verifica se o token JWT é válido quando carrega qualquer página (se existir).
        getAllOs(); //Inicia a execução das requisições de OS.
    }

    $(".app-version").html(app_version); //Insere a versão do app.

    $(".go-to-user-profile-inner").on("click", () => { //Função visual do menu.
        $(".profile-more-options-container").show();
        setTimeout(() => {
            $(".profile-more-options-container").toggleClass("opacity-1");
            $("#profile-more-options").toggleClass("rotate");
        }, 10);
    });

    $("#menu-hamburguer").on("click", () => { //Função para o menu responsivo.
        $(".responsive-profile-more-options-container").show();
        setTimeout(() => {
            $(".responsive-profile-more-options-container").toggleClass("opacity-1");
        }, 10);
    });
};

function fillUserImage() { //Função para preencher a imagem do usuário logado
    let id_usuario = getUserIdInSessionStorage();
    $.ajax({
        url: url_api + "/usuarios/" + id_usuario,
        type: "GET",
        success: (res) => {
            $(".user-name").html(res.response.nome);
            if (res.response.profile_photo == "") {
                res.response.profile_photo = url_api + "/public/default-user-image.png"; //Se o usuário não tiver foto, uma imagem padrão do servidor é colocada.
            }
            $(".avatar-header").attr("src", res.response.profile_photo);
        },
        complete: () => {
            setTimeout(fillUserImage, 36000); //Chamada recursiva da função a cada 36 segundos.
        }
    })
}

function checkIfJwtIsValid() { //Função para checkar se o JWT é valido, se não for, deleta o JWT atual do session storage e depois é redirecionado para o login.
    let jwt = "Bearer " + getJwtFromSessionStorage();
    let id_usuario = getUserIdInSessionStorage();
    
    $.ajax({
        url: url_api + "/usuarios/checkJWT/" + id_usuario,
        type: "GET",
        headers: {
            Authorization: jwt
        },
        success: (res) => {
            return;
        },
        error(xhr) {
            removeJwtFromSessionStorage();
        },
        complete: () => {
            setTimeout(checkIfJwtIsValid, 18000); //Chamada recursiva da função a cada 18 segundos.
        }
    });
}


function generateNumberOs(number) { //Função para gerar número completo da OS com base no ano e no mês atual, além do próprio id da OS em banco.
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

function resetOsFields(field1, field2, field3, field4) { //Função para resetar os campos do kanban.
    $(field1).html("");
    $(field2).html("");
    $(field3).html("");
    $(field4).html("");
};

function findOS(id) { //Função para encontrar a OS solicitada pelo ID da mesma.
    let os;
    $.ajax({
        url: url_api + "/os/" + id,
        type: "GET",
        async: false,
        success: (res) => {
            os = res.response.os_list
        }
    });
    return os[0];
};

function findPriority(priority, badge = 0) { //Função para encontrar as classes dos badges das OS segundo a prioridade dela.
    switch (priority) {
        case 1: 
            if (badge == 1) { return "normal" };
            return "Normal";
        case 2: 
            if (badge == 1) { return "priority" };
            return "Prioritário";
    };
};

function getAllOs() { //Função recupera a lista de OS do banco de dados.
    if (!in_drag) {
        let mainArrayOs;
        $.ajax({
            url: url_api + "/os",
            type: "GET",
            success: (res) => {
                mainArrayOs = res.response.os_list;
                if (mainArrayOs == null) { //Se não vier nada do banco de dados, assume um array vazio.
                    mainArrayOs = [];
                }
            },
            complete: () => {
                setOsInSessionStorage(mainArrayOs);
                loadOs(mainArrayOs);
                setTimeout(getAllOs, 5000); //Chamada recursiva da requisição.
            }
        });
    } else {
        setTimeout(getAllOs, 5000); //Chamada recursiva da requisição.
    }
};

function setOsInSessionStorage(mainArrayOs) { //Armazena a lista de OS em session storage para consulta rápida.
    let array = JSON.stringify((mainArrayOs));
    if (sessionStorage.getItem("os_list")) {
        sessionStorage.removeItem("os_list");
        sessionStorage.setItem("os_list", array);
    } else {
        sessionStorage.setItem("os_list", array);
    }
}

function getOsFromSessionStorage() { //Recupera a lista de OS em session storage para consulta rápida.
    return JSON.parse(sessionStorage.getItem("os_list"));
}

function showTooltip(id, user_owner, priority, size) { //Função mostra o tooltip da respectiva OS sobreposta e preenche as informações.
    if (window.innerWidth > 865) {
        if (!in_drag) {
            let border = "border: 2px solid ";
            switch (priority) {
                case "1": 
                    border += "#FFA500";
                    break;
                case "2": 
                    border += "#FF0000";
                    break;
            }
            setTimeout(() => {
                $(".os-tooltip").attr("id", "#tooltip-" + id);
                $(".os-tooltip").attr("style", border);
                $(".os-tooltip").html(`
                                        <h6 class="os-tooltip-number"><strong>(OS) ${id}</strong></h6>
                                        <h6><strong>Aberta por:</strong> ${user_owner}</h6>
                                        <h6><strong>Tamanho:</strong> ${size}</h6>
                                        <h6><strong>Expira:</strong> Não</h6>
                                        <h6><strong>H. Previstas:</strong> n/a</h6>
                                        <h6><strong>H. Restantes:</strong> n/a</h6>
                                    `);
                $(".os-tooltip").css("display", "block");
                setTimeout(() => {
                    $(".os-tooltip").css("opacity", 1);
                }, 20);
            }, 300);
        }
    }
}

function hideTooltip() { //Reseta e esconde tooltip
   setTimeout(() => {
        $(".os-tooltip").css("opacity", 0);
        setTimeout(() => {
            $(".os-tooltip").css("display", "none");
            $(".os-tooltip").attr("id", "");
            $(".os-tooltip").html("");
        }, 300);
   }, 100);
}

function turnOsDragabble() { //Acima de 865px de largura da tela, torna as OS arrastáveis
    if (window.innerWidth > 865) {
        $(".card-link").draggable({
            drag: (event, ui) => {
                in_drag = true;
                hideTooltip();
            } 
        });
        
        if ($(".card-link").attr("draggable") == "false"){
            $(".card-link").attr("draggable", "true");
            $(".card-link").draggable("enable");
        }
    } else {
        if ($(".card-link").attr("draggable") == "true") {
            $(".card-link").attr("draggable", "false");
            $(".card-link").draggable("disable");
        }
    }
}

function turnFieldDropable() { //Torna os campos do kanban aptos à aceitar OS que são arrastadas até eles e depois fazem uma chamada ajax para alterar o status da OS conforme a coluna do kanban.
    $(".col-scrum").droppable({
        drop: (event, ui) => {
            
            let jwt = "Bearer " + getJwtFromSessionStorage();
            let current_os_id = ui.helper[0].id.replace("link-", "");
            let os_array = getOsFromSessionStorage();
            
            let current_field;
            switch (event.target.id) {
                case "col-to-do":
                    current_field = 1;
                    break;
                case "col-doing": 
                    current_field = 2;
                    break;
                case "col-test":
                    current_field = 3;
                    break;
                case "col-done":
                    current_field = 4;
                    break;
            }

            for (let i in os_array) { //Faz o preenchimento do array de OS modificado antes da requisição para diminuir o delay e não causar bug visual.
                if (os_array[i].id_complete == current_os_id){
                    os_array[i].status_os = current_field;
                    loadOs(os_array);
                }
            }

            $.ajax({ //Requisição que atualiza o status da OS conforme o campo que ela jogou o card.
                url: url_api + "/os/" + current_os_id,
                headers: {
                    Authorization: jwt
                },
                async: false,
                type: "PATCH",
                data: {
                    status_os: current_field
                },
                success: (res) => { 
                    in_drag = false;
                }
            });
        },
        hoverClass: "os-list-overlay"
    });
}

function loadOs(mainArrayOs) { //Função aloca as OS's conforme status no kanban.
    if (mainArrayOs == undefined) {
        return;
    }
    
    resetOsFields("#col-to-do .os-list", "#col-doing .os-list", "#col-test .os-list", "#col-done .os-list");
    for (let i in mainArrayOs) {
        let card = `<a href="os-editar.html?id=${mainArrayOs[i].id_complete}&s=0" class="card-link" id="link-${mainArrayOs[i].id_complete}" draggable="false">
                        <div class="card-os" id="${mainArrayOs[i].id_complete}" onmouseenter="showTooltip('${mainArrayOs[i].id_complete}', '${mainArrayOs[i].user_owner}', '${mainArrayOs[i].priority}', '${mainArrayOs[i].size}')" onmouseleave="hideTooltip()">
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

    turnOsDragabble();
    turnFieldDropable();

    $(window).on("resize", () => {
        turnOsDragabble();
        turnFieldDropable();
    });

    $("#new-os-1").on("click", () => { //Vai para a tela de criar nova OS com status A FAZER.
        var url_os = new URL(system_url + "os-editar.html");
        url_os.searchParams.append("s", 1);
        window.location.href = url_os;
    });

    $("#new-os-2").on("click", () => { //Vai para a tela de criar nova OS com status FAZENDO.
        var url_os = new URL(system_url + "os-editar.html");
        url_os.searchParams.append("s", 2);
        window.location.href = url_os;
    });
};

$(".kanban").on("mouseleave", () => { //Se o mouse sair fora da div do kanban, significa que o usuário está tentando quebrar o layout e os campos são preenchidos novamente.
    in_drag = false;
    loadOs(getOsFromSessionStorage());
});

function excludeOs(param) { //Função exclui a OS solicitada através do ID.
    let currentOs = findOS(param);
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (currentOs == undefined) {
        $(".response").html("Não é possível excluir uma OS que não existe!");
    } else {
        $.ajax({
            url: url_api + "/os/" + param,
            headers: {
                Authorization: jwt
            },
            type: "DELETE",
            success: (res) => {
                window.location.href = app_name + "/index.html";
            }
        });
    };
};

function saveOs(os_number, priority, status, description, sponsor, user_owner, size, source) { //Função salva uma OS já existente através do ID.
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (source > 2000) { //Se o campo descrição tiver mais de 2000 caracteres, não é permitido salvar.
        return;
    };
    $.ajax({ //Requisição que atualiza a OS com o ID definido com os novos dados.
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
            sponsor: sponsor,
            user_owner: user_owner,
            size: size
        },
        success: (res) => {
            window.location.href = app_name + "/index.html";
        }
    });
};

function fillIdComplete(id_raw) { //Função cria o ID completo conforme o ID da OS retornada do banco e faz UPDATE da respectiva linha na tabela.
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
            window.location.href = app_name + "/index.html";
        }
    });
};

function createOs(priority, status, description, sponsor, user_owner, size, source) { //Função cria uma nova OS enviando dados dos inputs para o banco de dados.
    let jwt = "Bearer " + getJwtFromSessionStorage();
    if (source > 2000) { //Se o campo descrição tiver mais de 2000 caracteres, não é permitido salvar.
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
            sponsor: sponsor,
            user_owner: user_owner,
            size: size
        },
        success: (res) => {
            fillIdComplete(res.os_criada.id_os); //Ao final da requisição de criação, a requisição de preenchimento do ID completo é disparada.
        }
    });
};

function countCharacters(source, target, response) { //Função conta os caracteres do campo de descrição de OS e retorna para a tela.
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

if ($(".edit-os").length) { //Funções que rodam a partir do momento que entra na tela 'os-editar.html'.
    
    $.ajax({ //Requisição preenche o select de responsáveis com os nomes dos usuários cadastrados no banco.
        url: url_api + "/usuarios",
        type: "GET",
        async: false,
        success: (res) => {
            for (let i in res.response.lista_de_usuarios) {
                $("#sponsor").append(`<option value="${res.response.lista_de_usuarios[i].nome}">${res.response.lista_de_usuarios[i].nome}</option>`);
                $("#owner").append(`<option value="${res.response.lista_de_usuarios[i].nome}">${res.response.lista_de_usuarios[i].nome}</option>`);
            }
        }
    });

    let url = window.location.href;
    let paramValue1;
    let paramValue2;
    let param1excluded;
    let currentOs;

    let param1 = url.split("?");
    if (param1[1].indexOf("i") != -1) { //Se entrar aqui existe o parâmetro ID na url.
        param1excluded = param1[1].split("&");
        paramValue1 = param1excluded[0].replace("id=", "");
        paramValue2 = param1excluded[1].replace("s=", "");
        currentOs = findOS(paramValue1);
    } else {
        paramValue2 = param1[1].replace("s=", ""); //Se não somente o parametro S que indica em qual coluna do kanban ela foi criada.
    };
    if (paramValue1 != undefined) { //Se o parâmetro ID da url existir, ele pega o numero e coloca no campo id da OS.
        $("#so-number").val(paramValue1);
    };
    if (currentOs != undefined) { //Se entrar aqui é porque o usuário clicou para editar uma OS que já existe e preenche os dados dos campos.
        $("#sponsor").val(currentOs.sponsor);
        $("#status").val(currentOs.status_os);
        $("#priority").val(currentOs.priority);
        $("#description").val(currentOs.desc_os);
        $("#owner").val(currentOs.user_owner)
        $("#size").val(currentOs.size);
        
    } else {
        $("#status").val(paramValue2); //Se for uma nova OS, somente o valor do campo status é preenchido conforme o parâmetro da URL.
    };

    countCharacters("#description", ".count-characters", ".characters-response"); //Se inicia a contagem dos caracteres do campo descrição da OS.
    $("#description").on("keyup", () => {
        countCharacters("#description", ".count-characters", ".characters-response");
    });

    $("#cancel-operation").on("click", () => { //Cancela o que estiver fazendo na tela de os-editar.html e redireciona para a index.
        window.location.href = app_name + "/index.html";
    });

    $("#exclude-os").on("click", () => { //Solicita a exclusão da OS atual.
        excludeOs(paramValue1);
    });

    $("#save-os").on("click", () => { //Salva a OS atual ou cria uma nova, se nenhum campo estiver vazio.
        let os_number = $("#so-number").val();
        let priority = $("#priority").val();
        let status = $("#status").val();
        let description = $("#description").val();
        let sponsor = $("#sponsor").val();
        let user_owner = $("#owner").val();
        let source = $("#description").val().length;
        let size = $("#size").val();
        if (priority == "" || status == "" || description == "" || sponsor == "" || user_owner == "" || size == "") {
            $(".response").html("Não foi possível salvar a OS, campos vazios.");
        } else {
            $(".response").html("");
            if (currentOs != undefined) {
                saveOs(os_number, priority, status, description, sponsor, user_owner, size, source);
            } else {
                createOs(priority, status, description, sponsor, user_owner, size, source);
            }
        };
    });
};

function showPasswordToggleClass(element, older_class, new_class) {
    if ($(element).hasClass(older_class)) {
        $(element).removeClass(older_class);
        $(element).addClass(new_class);
        $("#password").attr("type", "text");
    } else if ($(element).hasClass(new_class)) {
        $(element).removeClass(new_class);
        $(element).addClass(older_class);
        $("#password").attr("type", "password");
    }
}

if ($(".login").length) { //Funções para tela de login.
    let url = window.location.href;
    let param = url.split("?")[1];
    if (param == "msg=time-out") {
        $(".response").html("Sessão expirada, faça login novamente");
        $(".response").show();
    }

    let currentEmail = $("#user").val(); //Pega o email do input.
    let email = getEmailInLocalStorage(); //Pega o email que foi guardado em local storage se existir.
    if (email != undefined) { //Se não existir nenhum e-mail previamente guardado em local storage, pega o email que está no input.
        fillEmail(email);
    };
    $("#user").on("keyup", () => { //Se o email no input não for igual ao que está em local storage, a opção de lembrar email é exibida.
        showRemember(email, currentEmail);
    });

    $("#password").on("keydown", () => { //Função exibe botão de mostrar senha quando existe algum valor no input de password
        setTimeout(() => {
            if (!$("#password").val() == "") {
                $(".show-password").show();
            } else {
                $(".show-password").hide();
            };
        }, 10);
    });

    $(".show-password").on("click", () => { //Botão que mostra ou esconde a senha.
        showPasswordToggleClass(".show-password i", "fa-eye-slash", "fa-eye");
    });

    $("#login-form").on("submit", (e) => {
        e.preventDefault();

        $("#login-form").find(".loading").html("");
        $("#login-form").find(".loading").hide();
        
        let data = $("#login-form").serializeArray().reduce(function (obj, item) { //Pega todos os dados do formulário e coloca em um objeto
            obj[item.name] = item.value;
            return obj;
        }, {});

        if (data['remember'] == 'on') { setEmailInLocalStorage(data['email']); } //Se o usuário marcou a opção de lembrar o email, pega o email do input e armazena em local storage.

        $("#login-form").find(".form-input").attr("disabled", true);
        $("#login-form").find(".loading").show();
        $("#login-form").find('.response').hide();
        
        $.ajax({
            url: url_api + "/usuarios/login",
            type: "POST",
            data: data,
            success: (res) => { //Se o usuário for autenticado, o token JWT e o ID são armazenados em session storage e redirecionado para index.html.
                setJwtInSessionStorage(res.token);
                setUserIdInSessionStorage(res.id_usuario);
                window.location.href = app_name + "/index.html";
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

function setUserIdInSessionStorage(id_usuario) { //Armazena ID do usuário logado em session storage.
    sessionStorage.setItem("user_id", id_usuario); 
}

function getUserIdInSessionStorage() { //Recupera ID do usuário logado em session storage.
    let user_id = sessionStorage.getItem("user_id");
    return user_id;
}


function logoutUser() { //Função para deslogar usuário removendo JWT e ID de session storage e redirecionando para login.html
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user_id");
    window.location.pathname = app_name + "/login.html"
}

function setEmailInLocalStorage(email) { //Se não existir um email em local storage ele armazena o que foi passado no parâmetro, se não ele sobrescreve o que já existia.
    let varEmail = getEmailInLocalStorage();
    if (varEmail != undefined) {
        localStorage.removeItem("e-mail");
        localStorage.setItem("e-mail", email);
        return;
    }
    localStorage.setItem("e-mail", email);
    return;
}

function getEmailInLocalStorage() { //Recupera o email de local storage.
    let email = localStorage.getItem('e-mail');
    if (email == undefined) { return; }
    return email;
}

function fillEmail(email) { //Pega o valor do parâmetro e preenche o campo email do formulário de login.
    $("#login-form").find("#user").val(email);
}

function showRemember(email1, email2) { //Mostra opção de lembrar email se os parâmetros passados na função forem diferentes.
    if (email1 == email2) { return; };
    $(".remember").css("display", "flex");
    return;
}

function getJwtFromSessionStorage() { //Recupera o token JWT de session storage.
    let jwt = sessionStorage.getItem("jwt_token");
    if (jwt == undefined) { return; }
    return jwt;
}

function setJwtInSessionStorage(token) { //Armazena o token JWT de session storage se não existir, ou sobrescreve se já existir.
    if (sessionStorage.getItem("jwt_token")) {
        sessionStorage.removeItem("jwt_token");
        sessionStorage.setItem("jwt_token", token);
        return;
    }
    sessionStorage.setItem("jwt_token", token);
    return;
}

function removeJwtFromSessionStorage() { //Remove o token JWT de session storage e envia para o login passando parametro na URL.
    sessionStorage.removeItem("jwt_token");

    var time_out_url = new URL(system_url + "login.html");
    time_out_url.searchParams.append("msg", "time-out");
    window.location.href = time_out_url;
}

if ($(".register").length) { //Funções para tela de registro
    $("#register-form").on("submit", (e) => {
        e.preventDefault();
        
        let data = $("#register-form").serializeArray().reduce(function (obj, item) { //Pega todos os dados do formulário e coloca em um objeto
            obj[item.name] = item.value;
            return obj;
        }, {});

        $("#register-form").find(".form-input").attr("disabled", true);
        $("#register-form").find(".loading").show();
        
        $.ajax({
            url: url_api + "/usuarios/cadastro",
            type: "POST",
            data: data,
            success: () => { //No sucesso na requisição de cadastro redireciona para fazer o login.
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

if ($(".update-profile").length) { //Funções para tela de alteração do perfil
    let id_usuario = getUserIdInSessionStorage();
    fillInformations("#nome", ".user-photo-inner", "#user-image", id_usuario); //Preenche a tela com as informações do usuário vindo do banco.

    let screenWidth = window.innerWidth;
    $(window).on("resize", () => {
        screenWidth = window.innerWidth;
    });

    $(".user-photo").on("mouseover", () => { //Mostra a opção de excluir imagem se for carregada uma imagem.
        if (screenWidth > 950) {
            if ($("#user-image").attr("src") != undefined) {
                $(".delete-image").css("transform", "translateY(0)");
            };
        }
    });

    $(".user-photo").on("mouseout", () => {  //Esconde a opção de excluir imagem se for carregada uma imagem.
        if (screenWidth > 950) {
            if ($("#user-image").attr("src") != undefined) {
                $(".delete-image").css("transform", "translateY(35px)");
            };
        }  
    });

    $(document).on("click", e => {
        let container = $(".user-photo-container");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $(".photo-options").hide();
        }
    })
    
    $(".delete-image").on("click", () => { //Remove a imagem atual do usuário.
        removeImage(id_usuario);
    });
    $(".user-photo-container").on("click", () => { //Abre mais opções da foto do usuário.
        togglePhotoOptions(".photo-options");
    });
    
    $(".show-photo").on("click", () => { //Abre um modal para ver a foto expandida.
        $(".photo-detail-container").show();
        $(".overlay").css("display", "flex");
        setTimeout(() => {
            $(".photo-detail-container").css("transform", "translateY(0)");
        }, 10);
        requireImage(id_usuario);
    });
    $(".upload-photo").on("click", () => { //Requisita o upload de uma nova imagem.
        sendPhoto();
    });

    $(".overlay").on("click", () => { //Quando clica fora do modal, ele se fecha, não necessitando de um botão de fechar.
        closeImageModal();
    });

    $("#nome").on("keyup", () => { //Se usuário estiver editando o nome, o botão se salvar aparece.
        $("#update-profile-button").show();
    });

    $("#update-profile-button").on("click", () => {
        let name = $("#nome").val();
        if (name.length > 9) { //Limitação do nome do usuário
            $(".response").html("Limite atingido!");
            return;
        }
        
        let jwt = "Bearer " + getJwtFromSessionStorage();
        $.ajax({ //Faz o update do nome do usuário
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

    $("#photo").on("change", (e) => { //Funções para quando um novo arquivo é carregado no modal de envio de nova imagem.
        let formData = new FormData;

        $(".file-name").css("display", "flex");

        $(".response").html("");
        let filePath = $("#photo").val();
        let fileSplited = filePath.split('\\');
        let fileName = fileSplited[fileSplited.length - 1];
        $('.file-name').html(fileName);

        let file = e.target.files.item(0);
        if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { //Se o arquivo tiver um desses formatos (PNG, JPG E JPEG), a imagem é exibida no modal e é permitida a requisição para o servidor.
            $("#send-photo-button").show();
            let adress = new FileReader();
            formData.set("user_imagem", file);
            adress.readAsDataURL(file);
            adress.onloadend = () => {
                $(".image-preview").attr("src", adress.result);
                $(".photo-preview").css("display", "flex");
            };

            $("#send-photo-button").on("click", () => {
                uploadPhoto(id_usuario, formData); //Faz a requisição de upload de foto.
            });
        } else {
            $(".image-preview").attr("src", "");
            $(".photo-preview").css("display", "none");
            $(".response").html("Tipo de arquivo não suportado");
        }
    });
};

function closeImageModal() { //Fecha o modal de envio da imagem.
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

function fillInformations(element1, element2, element3, user_id) { //Preenche as informações da tela de update-profile.html com o que vem de banco.
    let screenWidth = window.innerWidth;
    $(window).on("resize", () => {
        screenWidth = window.innerWidth;
    })
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
        },
        complete: () => {
            if (screenWidth < 950) {
                if ($("#user-image").attr("src") != undefined) {
                    $(".delete-image").css("transform", "translateY(0)");
                };
            }
        }
    });
};

function togglePhotoOptions(element) { //Abre ou fecha as opções de quando clica na foto do usuário.
    if ($(element).is(":visible")) {
        $(element).css("display", "none");
    } else {
        $(element).css("display", "flex");
    }  
};

function uploadPhoto(id, formData) { //Função faz o upload da imagem em si para o servidor e então, fecha o modal e recarrega a página.
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

function sendPhoto() { //Abre o modal de envio de uma nova imagem.
    $(".upload").show();
    setTimeout(() => {
        $(".upload").css("transform", "translateY(0)");
    }, 10);
    
    $(".overlay").show();
}

function requireImage(id_usuario) { //Pega a URL da imagem do usuário no banco.
    $.ajax({
        url: url_api + "/usuarios/" + id_usuario,
        type: "GET",
        success: (res) => {
            $(".photo-detail").attr("src", res.response.profile_photo);
            togglePhotoOptions(".photo-options");
        }
    });
};

function removeImage(id_usuario) { //Função remove a URL da imagem do respectivo usuário no banco de dados e recarrega a página.
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

