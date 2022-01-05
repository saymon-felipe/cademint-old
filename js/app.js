let in_drag = false; // Variável de controle para verificar se o usuário está movendo uma OS ou não.
let reloadInClose = false; // Variável que testa se foi feita uma alteração nos grupos ao fechar o modal Manage groups.

if($(document).length) { // Início da execução.
    if (window.location.pathname != app_name + "/login.html" && window.location.pathname != app_name + "/register.html" && window.location.pathname != app_name + "/enter_group_invitation.html") { //Se cair aqui significa que o usuário não está na tela de login, registro ou para entrar em um grupo, e as funções deverão ser executadas.
        fillUserImage(); // Carrega imagem do usuário.
        getAllOs(); // Inicia a execução das requisições de OS.
        fillAppVersion(); // Carrega a versão do software.
        createBackToTopElement(); // Cria o elemento de voltar ao topo.
    };

    $(".go-to-user-profile-inner").on("click", () => { // Cria a função que fará a rotação do ícone do menu ao clicar.
        $(".profile-more-options-container").show();
        setTimeout(() => {
            $(".profile-more-options-container").toggleClass("opacity-1");
            $("#profile-more-options").toggleClass("rotate");
        }, 10);
    });

    $("html, body").scroll(() => { // Mostra o botão de voltar ao topo se usuário tiver dado scroll na página, coisa que só acontece no responsivo.
        if ($("body").scrollTop() > 150) {
            $(".back-to-top").css("opacity", 1);
        } else {
            $(".back-to-top").css("opacity", 0);
        }
    });

    $(".back-to-top").on("click", () => { // Ao clicar no botão voltar ao topo, o scroll vai até 0.
        $("html, body").animate({scrollTop: 0}, "medium");
    });

    $("#menu-hamburguer").on("click", () => { // Exibe o menu responsivo ao clicar no icone de hamburguer.
        $(".responsive-profile-more-options-container").show();
        setTimeout(() => {
            $(".responsive-profile-more-options-container").toggleClass("opacity-1");
        }, 10);
    });

    $(document.body).on("click", ".group", e => { // Quando clica em algum elemento com a classe grupo é testado se o target é um icone para exclusão do grupo ou span para sair de um grupo, caso contrário apenas edita o grupo selecionado.
        let isResponsive = false;
        if (window.innerWidth < 580) {
            isResponsive = true;
        }

        if (isResponsive) { // Se a resolução for menor que 580, o modal de gerenciamento de grupos fica diferente e responsivo.
            if (e.target.nodeName == "I") {
                if ($(".responsive-edit-group")[0].childElementCount > 1) {
                    $("#" + e.currentTarget.id).remove();

                    excludeGroup(e.currentTarget);
                } else {
                    reloadInClose = true;

                    $(".group span").html("");
                    $(".my-groups ul li").css("padding", "0 1rem");
                }
            } else if (e.target.nodeName == "H6") {
                $("#" + e.currentTarget.id).remove();
                leaveGroup(e.currentTarget);

                if ($(".other-groups-list")[0].childElementCount) {
                    editGroup($(".my-groups-list .group:first")[0]);
                }
            } else {
                if ($(".responsive-group-body").is(":visible")) {
                    $(".responsive-group-body").hide();
                }

                $(".responsive-group").removeClass("group-active"); // Reseta todos os grupos com essa classe.
                e.currentTarget.parentElement.classList.add("group-active");
                e.currentTarget.parentElement.children[1].setAttribute("style", "display: flex;");

                $(".new-member-input").remove();
                $(".responsive-new-member h6").show();
                $(".responsive-new-member i").show();
            }
        } else {
            if (e.target.nodeName == "I") {
                if ($(".my-groups-list")[0].childElementCount > 1) {
                    $("#" + e.currentTarget.id).remove();
                    excludeGroup(e.currentTarget);
                } else {
                    reloadInClose = true;
                    $(".group span").html("");
                    $(".my-groups ul li").css("padding", "0 1rem");
                }
            } else if (e.target.nodeName == "H6") {
                $("#" + e.currentTarget.id).remove();
                leaveGroup(e.currentTarget);

                if ($(".other-groups-list")[0].childElementCount) {
                    editGroup($(".my-groups-list .group:first")[0]);
                }
            } else {
                let target = e.target;

                $(".group").removeClass("group-active"); // Reseta todos os grupos com essa classe.
                hideNewMemberInput();

                target.classList.add("group-active");
                $("#current_project").val(target.innerText);
                $("#current_project").val($("#current_project").val() + "," + target.id);

                editGroup(target);
            }
        }
    });

    $(".new-member").on("click", () => { // Função mostra o input para enviar solicitação por email à alguém, tamém exibe o botão para salvar e valida o email do input quando o elemento perde o foco.
        let inputElement = "<input type='email' placeholder='Insira o email' class='new-member-input' /><div class='loading'></div>";

        if (!$(".new-member-input").length) {
            $(".members-list").append(inputElement);
        }

        $(".new-member-input").css("opacity", 1);
        $(".new-member-input").focus();
        $(".manage-groups_modal .modal-footer .create-button").show();

        setTimeout(() => {
            $(".manage-groups_modal .modal-footer .create-button").css("opacity", 1);
        }, 5);

        $(".new-member-input").on("blur", () => {
            validateEmail($(".new-member-input").val())
        });
    });

    $(".manage-groups_modal .modal-footer .create-button").on("click", () => { // Ao clicar em salvar no modal de convidar usuários, envia um email para o endereço do input.
        let functionParams = ["", ""];
        let groupId = $("#current_project").val().split(",")[1].replace("group-", "");

        if (window.innerWidth < 580) { // (CASO RESPONSIVO)
            functionParams = [true, $(".responsive-group.group-active .my-group").attr("id").replace("group-", ""), $(".responsive-group.group-active .my-group h5").html()];
            groupId = $(".responsive-group.group-active .my-group").attr("id").replace("group-", "");
        }

        $(".manage-groups_modal .modal-footer .create-button").attr("disabled", "disabled");

        if (validateEmail($(".new-member-input").val())) {
            $.ajax({
                url: url_api + "/projects/return_group",
                type: "POST",
                data: {
                    group_id: groupId
                },
                complete: (res) => {
                    if (res.responseJSON.response.group_owner == getUserIdInLocalStorage()) {
                        $(".manage-groups_modal .loading").show();
                        sendEmailToEnterGroup(functionParams[0], functionParams[1], functionParams[2]);
                    }
                }
            });
        }
    });

    $(".overlay").on("click", () => { // Quando clica fora do modal, ele se fecha.
        hideToggleProjects();
        closeImageModal();
        closeExcludeAccountModal();
        closeNewProjectModal();
        closeManageGroupsModal();
    });
};

function createBackToTopElement() { // Cria o elemento de voltar ao topo e adiciona no body.
    let element = `
                <div class="back-to-top">
                    <i class="fas fa-arrow-circle-up"></i>
                </div>
                `
    $("body").append(element);
}

function manageGroups() { // Função exibe o modal de gerenciamento dos grupos e preenche com os projetos do usuário.
    openManageGroupModal();

    if (window.innerWidth < 579) {
        setTimeout(() => {
            fillUserProjectsInModal(getUserIdInLocalStorage(), true);
        }, 15);
    } else {
        setTimeout(() => {
            fillUserProjectsInModal(getUserIdInLocalStorage());
        }, 15);;
    }

    $(window).on("resize", () => {
        if (window.innerWidth < 579) {
            setTimeout(() => {
                fillUserProjectsInModal(getUserIdInLocalStorage(), true);
            }, 15);
        } else {
            setTimeout(() => {
                fillUserProjectsInModal(getUserIdInLocalStorage());
            }, 15);
        }
    });
}

function fillUserProjectsInModal(user_id, responsive = false) { // Função preenche os projetos do usuário no modal.
    let currentUser = requireUser(user_id);
    let currentUserId = getUserIdInLocalStorage();
    let currentUserProjects = currentUser.user_groups;

    $(".my-groups-list").html(""); // Reseta os campos de meus grupos e outros grupos.
    $(".other-groups-list").html("");
    $(".responsive-edit-group").html("");

    $(".modal-body-loading .loading").hide(); // Após o carregamento dos grupos, o loading e o container são escondidos e o modal body é exibido.
    $(".modal-body-loading").hide();
    $(".modal-body").css("display", "flex");

    if (!responsive) {
        for (let i in currentUserProjects) { // Percorre todos os projetos do usuário, e se ele for o proprietário do grupo, o grupo aparece na lista de meus grupos, caso contrário em outros grupos.
            if (currentUserProjects[i].group_owner == currentUserId) {
                $(".my-groups-list").append(mountGroupElement(currentUserProjects[i].group_name, currentUserProjects[i].groups_id, "my-group", currentUser.id_usuario));
            } else {
                $(".other-groups-list").append(mountGroupElement(currentUserProjects[i].group_name, currentUserProjects[i].groups_id, "other-group", currentUser.id_usuario));
            }
        }

        $(".my-groups-list .group:first")[0].classList.add("group-active"); // Ao final é adicionado a classe group-active ao primeiro elemento da lista meus grupos.
        $("#current_project").val($(".my-groups-list .group:first")[0].innerText + "," + $(".my-groups-list .group:first")[0].id); // O input hidden recebe o nome e o id do grupo atual como valor.

        if ($(".my-groups-list")[0].childElementCount == 1) { // Se só existir um elemento nos meus grupos, o padding é resetado e o span é zerado.
            $(".my-groups ul li").css("padding", "0 1rem");
            $(".group span").html("");
        }

        editGroup($(".my-groups-list .group:first")[0]); // Edita o grupo clicado.
    } else {
        $("#responsive-my-groups").on("click", () => {
            $(".responsive-group-modal-body li").removeClass("button-active");
            $("#responsive-my-groups").addClass("button-active");
            $(".responsive-edit-group").html("");
            for (let i in currentUserProjects) { // Percorre todos os projetos do usuário, e se ele for o proprietário do grupo, o grupo aparece na lista de meus grupos, caso contrário em outros grupos.
                if (currentUserProjects[i].group_owner == currentUserId) {
                    $(".responsive-edit-group").append(mountGroupElement(currentUserProjects[i].group_name, currentUserProjects[i].groups_id, "my-group", "responsive", currentUserProjects[i]));
                }
            }

            if ($(".responsive-edit-group")[0].childElementCount == 1) { // Se só existir um elemento nos meus grupos, o padding é resetado e o span é zerado.
                $(".group span").html("");
            }
        });

        $("#responsive-other-groups").on("click", () => {
            $(".responsive-group-modal-body li").removeClass("button-active");
            $("#responsive-other-groups").addClass("button-active");
            $(".responsive-edit-group").html("");
            for (let i in currentUserProjects) { // Percorre todos os projetos do usuário, e se ele não for o proprietário do grupo, o grupo aparece na lista de outros grupos.
                if (currentUserProjects[i].group_owner != currentUserId) {
                    $(".responsive-edit-group").append(mountGroupElement(currentUserProjects[i].group_name, currentUserProjects[i].groups_id, "other-group", "responsive", currentUserProjects[i]));
                }
            }
        });

        $("#responsive-my-groups").click();

        $(".remove-user").on("click", (e) => { // Se um membro for removido pelo dono do grupo, o elemento é destruído e o usuário é retirado do grupo.
            let project = findProjectNameById(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].id.replace("group-", ""));
            excludeUserButton(e, project);
        });

        $(".other-group h6").on("click", (e) => { // Se um membro for removido pelo dono do grupo, o elemento é destruído e o usuário é retirado do grupo.
            let project = findProjectNameById(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].id.replace("group-", ""));
            excludeUserButton(e, project);
        });

        $(".responsive-new-member").on("click", (e) => { // Função mostra o input para enviar solicitação por email à alguém, tamém exibe o botão para salvar e valida o email do input quando o elemento perde o foco.
            let inputElement = "<input type='email' placeholder='Insira o email' class='new-member-input' /><div class='loading'></div>";

            $(".new-member-input").remove();
            $(".responsive-new-member .loading").remove();

            if (!$(".new-member-input").length) {
                $("#" + e.currentTarget.id).append(inputElement);
            }
            $("#" + e.currentTarget.id + " h6").hide();
            $("#" + e.currentTarget.id + " i").hide();

            $(".new-member-input").css("opacity", 1);
            $(".new-member-input").focus();
            $(".manage-groups_modal .modal-footer .create-button").show();

            setTimeout(() => {
                $(".manage-groups_modal .modal-footer .create-button").css("opacity", 1);
            }, 5);

            $(".new-member-input").on("blur", () => {
                validateEmail($(".new-member-input").val())
            });
        });
    }
}

function hideNewMemberInput() { // Função esconde o input para enviar email.
    $(".new-member-input").val("");
    $(".new-member-input").css("opacity", 0);
    $(".manage-groups_modal .modal-footer .create-button").css("opacity", 0);

    setTimeout(() => {
        $(".manage-groups_modal .modal-footer .create-button").hide();
        $(".new-member-input").remove();
    }, 400);
}

function validateEmail(email) { // Função faz a validação do email no input, se for inválido é adicionada uma borda vermelha.
    let specialCharacterPosition = email.indexOf("@");
    if (specialCharacterPosition == -1 || email.indexOf(".com") == -1 || specialCharacterPosition == 0 || email[specialCharacterPosition + 1] == ".") { //O email precisa ter @ e .com, o @ não pode ser o 1 caractere e o . não pode ser o 2. 
        $(".new-member-input").css("border", "1px solid red");
        return false;
    } else {
        $(".new-member-input").css("border", "1px solid var(--gray-high-2)");
        return true;
    }
}

function sendEmailToEnterGroup(responsive = false, group_id = "", group_name = "") { // Função envia email de solicitação para o endereço informado, e ao final da requisição esconde o input.
    let jwt = "Bearer " + getJwtFromLocalStorage();
    let groupName, groupId;

    if (responsive) { // Testa para ver se é responsivel e enviar email conforme os campos do modal.
        groupName = group_name;
        groupId = group_id;
    } else {
        groupName = $("#current_project").val().split(",")[0];
        groupId = $("#current_project").val().split(",")[1].replace("group-", "");
    }

    $.ajax({
        url: url_api + "/projects/request_user_to_group",
        headers: {
            Authorization: jwt
        },
        type: "POST",
        data: {
            user_email: $(".new-member-input").val(),
            group_name: groupName,
            group_id: groupId
        },
        complete: () => {
            $(".manage-groups_modal .modal-footer .create-button").attr("disabled", false);
            $(".manage-groups_modal .loading").hide();
            hideNewMemberInput();

            setTimeout(() => {
                $(".responsive-new-member h6").show();
                $(".responsive-new-member i").show();
            }, 400);
        }
    });
}

if ($(".enter-group-invitation").length) { // Função para a página enter-group-invitation.

    let params = window.location.search.substring(1).split("&"); // Armazena cada parametro da URL em variáveis.
    let groupIdParam = params[0].replace("gid=", "");
    let tokenParam = params[1].replace("tk=", "");
    let emailParam = params[2].replace("email=", "");

    $("#enter-group").on("click", () => { // Ao clicar no botão de entrar no grupo, são feitas algumas tratativas então o usuário é adicionado ao grupo.
        $.ajax({
            url: url_api + "/usuarios/return_user_by_email",
            type: "POST",
            data: {
                email: emailParam
            },
            success: (res) => { 
                if (res.response.usuario == 0) { // Se o usuário informado não estiver cadastrado, o mesmo é redirecionado para o registro passando os parametros group_id, token e email na URL.
                    window.location.href = `/register.html?gid=${groupIdParam}&tk=${tokenParam}&email=${emailParam}`;
                } else {
                    localStorage.removeItem("jwt"); // Se o usuário for cadastrado, o eventual usuário atual é deslogado, é feito o redirecionamento para o login e o email do usuário convidado é preenchido no input.
                    removeUserIdInLocalStorage();
                    removeCurrentProjectIdInSessionStorage();
                    removeOsListFromSessionStorage();

                    let user = res.response.usuario;
                    let user_groups;

                    if (user.user_groups.indexOf(",") == -1) {
                        user_groups = [user.user_groups];
                    } else {
                        user_groups = user.user_groups.split(",");
                    }

                    if (user_groups.indexOf(groupIdParam) == -1) { // Se não existir o grupo solicidado na lista de grupos do usuário, o mesmo é adicionado no grupo, caso contrario aparece uma mensagem informativa e depois de 5 segundos é redirecionado para o login.
                        addUserToGroup(groupIdParam, tokenParam, user.id_usuario, emailParam);
                    } else {
                        $(".enter-group-container .response").html("Você já faz parte desse grupo!");
                        $(".enter-group-container .response").show();
                        setTimeout(() => {
                            window.location.href = "/login.html";
                        }, 5000);
                    }
                }
            }
        });
    });
}

function addUserToGroup(group_id, token, user_id, user_email) { // Função adiciona usuário ao grupo.
    $.ajax({
        url: url_api + "/projects/enter_group_with_token",
        type: "POST",
        data: {
            token: token,
            email_requested: user_email,
            user_id: user_id,
            group_id: group_id
        },
        success: () => { 
            var url = new URL(system_url + "/login.html"); // Se der certo, é direcionado para o login com o parametro joined_group que servirá para abrir o modal.
            url.searchParams.append("joined_group", true);
            window.location.href = url;
        },
        error: (xhr) => {
            $(".enter-group-container .response").html(xhr.responseJSON.message); // Se der erro, o mesmo é exibido e depois de 5 segundos é feito o redirecionamento para o login.
            $(".enter-group-container .response").show();
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 5000);
        }
    });
}

function showToggleProjects() { // Função preenche os projetos no modal responsivo.
    let projectsElement = $("#projects-name")[0].children;
    
    $(".responsive-choose-project-modal").show();
    $(".overlay").show();

    setTimeout(() => {
        $(".responsive-choose-project-modal").css("transform", "translateY(0)");
    }, 10);

    for (let i in projectsElement) { // Percorre todos os OPTIONS do elemento de seleção de grupos principal para preencher em um elemento span no modal responsivo.
        if (projectsElement[i].nodeName == "OPTION") {
            let responsiveGroupElement = `<span id="project-${projectsElement[i].getAttribute("id").replace("project-", "")}" class="responsive-project">${projectsElement[i].innerHTML}</span>`
            $(".responsive-projects-list").append(responsiveGroupElement);
        }
    }
    
    let responsiveProjectsElement = $(".responsive-projects-list")[0].children;

    for (let i in responsiveProjectsElement) { // É feito uma varredura nos elementos do modal, se algum deles tiver o id igual ao armazenado em local storage, o mesmo fica com a classe current-project.
        if (responsiveProjectsElement[i].nodeName == "SPAN") {
            if (responsiveProjectsElement[i].getAttribute("id").replace("project-", "") == getCurrentProjectIdInSessionStorage()) {
                responsiveProjectsElement[i].classList.add("current-project");
            }
        }
    }

    $(".responsive-project").on("click", (event) => { // Ao clicar em algum elemento no modal responsivo, o id dele é armazenado em local storage e o modal é fechado.
        let elementId = event.target.id.replace("project-",  "");
        setCurrentProjectIdInSessionStorage(elementId);
        hideToggleProjects();
    });
}

function hideToggleProjects() { // Função fecha o modal responsivo de projetos
    $(".responsive-choose-project-modal").css("transform", "translateY(-100vh)");
    setTimeout(() => {
        $(".responsive-projects-list").html("");
        $(".responsive-choose-project-modal").hide();
        $(".overlay").hide();
        $("#change-project").toggleClass("rotate");
    }, 400);
}

if ($(".index").length) {

    let userId = getUserIdInLocalStorage();

    let url = new URL(window.location);
    if (url.searchParams.get("joined_group")) { // Se ecistir o parâmetro joined_group na URL, o modal é exibido.
        setTimeout(() => {
            $(".enter-group-message").css("display", "flex");
            $(".overlay").css("display", "block");
            setTimeout(() => {
                $(".enter-group-message").css("transform", "translateY(0)");
            }, 10);
        }, 400);
    }

    $(".enter-group-message button").on("click", () => { // Ao clicar em OK no modal enter-group-message, ele é fechado e o parametro joined_group é retirado da url.
        $(".enter-group-message").css("transform", "translateY(-100vh)");
        
        setTimeout(() => {
            $(".enter-group-message").css("display", "none");
            $(".index .overlay").css("display", "none");
            window.location = document.URL.replace("?joined_group=true", "");
        }, 400);
    });

    fillUserProjects(userId); // Os projetos do usuário são preenchidos no select principal.

    let currentProject = getCurrentProjectIdInSessionStorage();
    if (currentProject != undefined) {
        $.ajax({
            url: url_api + "/projects/return_group",
            type: "POST",
            data: {
                group_id: currentProject
            },
            success: (res) => { 
                $("#projects-name").val(res.response.nome)
            },
            error: () => {
                removeCurrentProjectIdInSessionStorage();
            }
        });
    } else {
        findProjectByName($("#projects-name").val());
        getAllOs();
    }

    $("#new-project").on("click", () => { // Ao clicar no botão de criar um novo projeto, o modal é exibido;
        createNewProject(userId);
    });

    $("#change-project").on("click", () => { // Ao clicar no botão de trocar projeto que só aparece no responsivo, o modal responsivo é exibido.
        $("#change-project").toggleClass("rotate");
        showToggleProjects();
    });

    $("#projects-name").on("change", () => { // No onchange do select procura o grupo pelo nome no input e armazena em session storage.
        if ($("#projects-name").val() != null) {
            findProjectByName($("#projects-name").val());
        }
    });
    
    $("#close-new-project-modal").on("click", () => { // Fecha o modal de novo projeto ao clicar no X.
        closeNewProjectModal();
    });

    $(".cancelate-button").on("click", () => { // Fecha o modal de projetos ao clicar em cancelar.
        closeNewProjectModal();
        closeManageGroupsModal();
    });

    $("#close-manage-projects-modal").on("click", () => { // Fecha o modal de gerenciar projetos ao clicar no X.
        closeManageGroupsModal();
    });
}

function leaveGroup(element) { // Função retira o usuário do grupo solicitado.
    let project = findProjectNameById(element.id.replace("group-", ""));
    let project_id = project.group_id;
    let user_id = getUserIdInLocalStorage();

    excludeGroupFromUser(user_id, project_id); // Remove o grupo da lista do usuário.
    excludeUserFromProject(project_id, user_id); // Remove o usuário da lista do grupo.

    if (getCurrentProjectIdInSessionStorage() == project_id) { // Se o id do grupo que está sendo excluido for igual ao que está em session storage, o que está armazenado é deletado.
        removeCurrentProjectIdInSessionStorage();
    }

    reloadInClose = true; // Variável que fará a página recarregar ao fechamento do modal.
}

function excludeGroup(element) { // Função apaga o grupo solicitado.
    let jwt = "Bearer " + getJwtFromLocalStorage();
    let project = findProjectNameById(element.id.replace("group-", ""));
    let project_id = project.group_id;
    let group_members = project.group_members.split(",");

    $.ajax({
        url: url_api + "/projects/delete_group",
        headers: {
            Authorization: jwt
        },
        type: "DELETE",
        data: {
            groups_id: project_id
        },
        success: () => { 
            excludeGroupFromMembers(group_members, project_id); // Exclui o grupo da lista de todos os membros.

            if (getCurrentProjectIdInSessionStorage() == project_id) { // Se o id do grupo que está sendo excluido for igual ao que está em session storage, o que está armazenado é deletado.
                removeCurrentProjectIdInSessionStorage();
            }
        }
    });
}

function excludeUserFromProject(project_id, user_id) { // Exclui o usuário do grupo.
    let jwt = "Bearer " + getJwtFromLocalStorage();

    $.ajax({
        url: url_api + "/projects/exclude_user",
        headers: {
            Authorization: jwt
        },
        type: "POST",
        data: {
            group_id: project_id,
            user_id: user_id
        }
    });
}

function excludeGroupFromUser(user_id, project_id) { // Exclui o grupo do usuário.
    let jwt = "Bearer " + getJwtFromLocalStorage();
    $.ajax({
        url: url_api + "/usuarios/exclude_group",
        type: "POST",
        headers: {
            Authorization: jwt
        },
        async: false,
        data: {
            group_id: project_id,
            user_id: user_id
        },
        complete: () => {
            if (window.innerWidth < 579) {
                fillUserProjectsInModal(getUserIdInLocalStorage(), true); // Ao finalizar, o modal dos projetos é preenchido denovo.
            } else {
                fillUserProjectsInModal(getUserIdInLocalStorage()); // Ao finalizar, o modal dos projetos é preenchido denovo.
            }
        }
    });
}

function excludeGroupFromMembers(group_members, project_id) { // Exclui o grupo da lista de todos os membros.
    for (let i in group_members) {
        excludeGroupFromUser(group_members[i], project_id);
    }
}

function createUserElement(user_object, user_id, user_name, proprietary) { // Cria o elemento do usuário que preencherá a lista quando edita algum grupo.
    let userElement;

    if (proprietary && user_id != getUserIdInLocalStorage()) { // Se o usuário logado for o dono do grupo, ele adiciona um icone para remover os outros participantes do grupo.
        userElement = `
        <div class="member">
            <img src="${requireImage(user_id, user_object)}" class="avatar-p" alt="Imagem de ${user_name}">
            <h1>${user_name}</h1>
            <div class="remove-user">
                <i class="fas fa-times" id="member-${user_id}"></i>
            </div>
            <input type="hidden" value="${user_id}" />
        </div>
        `
    } else {
        userElement = `
        <div class="member">
            <img src="${requireImage(user_id, user_object)}" class="avatar-p" alt="Imagem de ${user_name}">
            <h1>${user_name}</h1>
            <input type="hidden" value="${user_id}" />
        </div>
        `
    }
    
    return userElement;
}

function editGroup(element) { // Função edita o grupo clicado, preenchendo os seus membros na lista.
    if (element.classList[1] == "other-group") { // Se for um grupo que não sou proprietário, o input para convidar membros pelo email é escondido.
        $(".new-member").hide();
    } else {
        $(".new-member").show();
    }

    let project = findProjectNameById(element.id.replace("group-", ""));
    let groupMembers = project.group_members_objects;

    $(".members-list").html(""); // Antes do preenchimento, a lista de usuários é resetada.

    for (let i in groupMembers) { // É criado um elemento para cada membro do grupo.
        if (project.group_owner == getUserIdInLocalStorage()) {
            $(".members-list").prepend(createUserElement(groupMembers[i], groupMembers[i].id_usuario, groupMembers[i].nome, true));
        } else {
            $(".members-list").prepend(createUserElement(groupMembers[i], groupMembers[i].id_usuario, groupMembers[i].nome, false));
        }
    }

    $(".remove-user").on("click", (e) => { // Se um membro for removido pelo dono do grupo, o elemento é destruído e o usuário é retirado do grupo.
        excludeUserButton(e, project);
    });
}

function excludeUserButton(e, project) {
    let userTarget = e.target.id.replace("member-", "");

    removeUserFromGroup(userTarget, project, getUserIdInLocalStorage());
    e.currentTarget.parentElement.remove();
}

function removeUserFromGroup(remove_user_id, project_element, current_user) { // Função remove o usuário do grupo.
    if (project_element.group_owner != current_user || current_user == remove_user_id) { // Se o dono do grupo não for o usuário logado OU o usuário logado for IGUAL ao usuário que será removido a função retorna se não exclui o usuário do projeto e o projeto do usuário.
        return;
    }

    let jwt = "Bearer " + getJwtFromLocalStorage();

    $.ajax({
        url: url_api + "/projects/exclude_user",
        type: "POST",
        headers: {
            Authorization: jwt
        },
        data: {
            group_id: project_element.group_id,
            user_id: remove_user_id
        },
        success: () => { 
            $.ajax({
                url: url_api + "/usuarios/exclude_group",
                type: "POST",
                headers: {
                    Authorization: jwt
                },
                async: false,
                data: {
                    group_id: project_element.group_id,
                    user_id: remove_user_id
                }
            });
        }
    });
}

function findProjectByName(group_name) { //Encontra o projeto pelo nome armazena o id em session storage.
    $.ajax({
        url: url_api + "/projects/return_group_by_name",
        type: "POST",
        data: {
            group_name: group_name
        },
        success: (res) => { 
            setCurrentProjectIdInSessionStorage(res.response.group_id);
            location.reload();
        },
        error: () => {
            removeCurrentProjectIdInSessionStorage();
        }
    });
}

function findProjectNameById(group_id) { // Retorna o projeto através do id.
    let group;

    $.ajax({
        url: url_api + "/projects/return_group",
        type: "POST",
        async: false,
        data: {
            group_id: group_id
        },
        success: (res) => {
            group = res.response
        },
        error: () => {
            removeCurrentProjectIdInSessionStorage();
        }
    });

    return group;
}

function formModalNewProject(userId) { // Cria um novo projeto através do nome no input, se for vazio exibirá uma mensagem.

    if ($("#group_name").val() == "") {
        $(".response").html("O grupo não pode ter um nome vazio!");
        setTimeout(() => {
            $(".response").html("");
        }, 5000);
    } else {
        let data = {
            group_name: $("#group_name").val(),
            group_members: userId
        }
        createNewProjectFromModal(data);
    }
}

function createNewProject(userId) { // Abre o modal de novo projeto e faz algumas tratativas conforme o botão clicado.
    $(".overlay").show();
    $(".new-project-modal").show();

    setTimeout(() => {
        $(".new-project-modal").css("transform", "translateY(0)");
        $(".modal-body").css("display", "flex");
        $("#group_name").focus();
    }, 10);

    $(".new-project-modal").keydown( event => {
        switch (event.keyCode) {
            case 13: 
                event.preventDefault();
                formModalNewProject(userId);
                break;
            case 27:
                closeNewProjectModal();
                break;
        }
    });

    $(".create-button").on("click", e => {
        e.preventDefault();
        formModalNewProject(userId);
    });
}

function mountResponsiveUserElement(group_member, group_classification) { // Monta o elemento do usuário conforme a classificação do grupo.
    let removeUserElement = "";

    if (getUserIdInLocalStorage() != group_member.id_usuario && group_classification != "other-group") {
        removeUserElement = "<i class='fas fa-times' id=member-" + group_member.id_usuario + "></i>";
    }

    return `
            <div class="member">
                <img src="${group_member.profile_photo != "" ? group_member.profile_photo : url_api + "/public/default-user-image.png"}" class="avatar-p">
                <h1>${group_member.nome}</h1>
                <div class="remove-user">
                    ${removeUserElement}
                </div>
                <input type="hidden" value="${group_member.id_usuario}" />
            </div> 
            `
}

function mountGroupElement(name, id_number, group_classification, responsive, currentUserProjects = "") { // Monta os elemento de grupo conforme a condição se o usuário é proprietário deles ou não.
    let obj;
    let groupMembersElementArray = [];

    if (responsive == "responsive") { // Se for responsivo, os usuários ficam dentro dos grupos, se não ficam em outra div.
        for (let i in currentUserProjects.group_members) {
            if (currentUserProjects.group_members != ",") {
                groupMembersElementArray.push(mountResponsiveUserElement(currentUserProjects.group_members[i], group_classification));
            }
        }

        if (group_classification == "other-group") {
            obj = `
                    <div class="responsive-group">
                        <div class="group ${group_classification}" id="group-${id_number}">${name}<h6>Sair</h6></div>
                        <div class="responsive-group-body">
                            <div class="responsive-members-list-container">
                                <div class="responsive-members-list">
                                    ${groupMembersElementArray.toString().replace(",", "")}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        } else {
            obj = `
                    <div class="responsive-group">
                        <div class="group ${group_classification}" id="group-${id_number}"><h5>${name}</h5><span><i class='fas fa-trash-alt'></i></span></div>
                        <div class="responsive-group-body">
                            <div class="responsive-members-list-container">
                                <div class="responsive-members-list">
                                    ${groupMembersElementArray.toString().replace(",", "")}
                                </div>
                            </div>
                            <div class="responsive-new-member" id="new-member-group-${id_number}">
                                <i class="fas fa-plus-circle"></i>
                                <h6>Novo membro</h6>
                            </div>
                        </div>
                    </div>
                `;
        }
    } else {
        if (group_classification == "other-group") {
            obj = `<li class="group ${group_classification}" id="group-${id_number}">${name}<h6>Sair</h6></li>`;
        } else {
            obj = `<li class="group ${group_classification}" id="group-${id_number}">${name}<span><i class='fas fa-trash-alt'></i></span></li>`;
        }
    }
    
    return obj;
}

function fillUserProjects(user_id) { // Adiciona os projetos no select principal
    let currentUser = requireUser(user_id);
    let currentUserGroups = currentUser.user_groups;

    $("#projects-name").html(""); // Antes de fazer o preenchimento, o select é resetado.

    for (let i in currentUserGroups) {
        let option = `
                <option value="${currentUserGroups[i].group_name}" id="project-${currentUserGroups[i].groups_id}">${currentUserGroups[i].group_name}</option>
                `
        $("#projects-name").prepend(option);
    }
}

function removeCurrentProjectIdInSessionStorage() { // Remove o id do projeto de session storage.
    sessionStorage.removeItem("current_group_id");
}

function setCurrentProjectIdInSessionStorage(group_id) { // Adiciona o id do projeto de session storage.
    sessionStorage.setItem("current_group_id", group_id);
}

function getCurrentProjectIdInSessionStorage() { // Retorna o id do projeto de session storage.
    return sessionStorage.getItem("current_group_id");
}

function createNewProjectFromModal(object) { // Cria um novo projeto a partir do modal.
    $.ajax({
        url: url_api + "/projects",
        type: "POST",
        data: {
            group_name: object.group_name,
            group_members: object.group_members,
            group_owner: getUserIdInLocalStorage()
        },
        success: (res) => {
            setCurrentProjectIdInSessionStorage(res.response.grupo_criado.groups_id);
            addGroupToUser(getUserIdInLocalStorage(), res.response.grupo_criado.groups_id);
            closeNewProjectModal();

            location.reload();
        }
    });
}

function createNewProjectFromRegister(user_id) { // Cria um novo projeto quando um usuário se registra, o projeto é criado como: "Projeto de {nome do usuário}".
    let name = requireUser(user_id).nome;
    let group_name = "Projeto de " + name;

    $.ajax({
        url: url_api + "/projects",
        type: "POST",
        async: false,
        data: {
            group_name: group_name,
            group_members: user_id,
            group_owner: user_id
        },
        success: (res) => {
            addGroupToUser(user_id, res.response.grupo_criado.groups_id);
        }
    });
}

function addGroupToUser(user_id, group_id) { // Adiciona o id do grupo ao usuário.
    let groupsOfMember = requireUser(user_id).user_groups;
    let newGroupsOfMember = [];

    for (let i in groupsOfMember) {
        newGroupsOfMember[i] = groupsOfMember[i].groups_id;
    }

    newGroupsOfMember.push(group_id);

    let newGroupsOfMemberString;
    for (let i in newGroupsOfMember) {
        if (i == 0) {
            newGroupsOfMemberString = newGroupsOfMember[i];
        } else {
            newGroupsOfMemberString += "," + newGroupsOfMember[i];
        }
    }

    $.ajax({
        url: url_api + "/usuarios/update_groups",
        type: "POST",
        async: false,
        data: {
            user_groups: newGroupsOfMemberString,
            id: user_id
        }
    });
}

function openManageGroupModal() { // Abre o modal de gerenciamento dos grupos.
    $(".manage-groups_modal").show();
    $(".overlay").show();

    setTimeout(() => {
        $(".manage-groups_modal").css("transform", "translateY(0)");
        $(".modal-body-loading .loading").show();
    }, 10);
}

function closeManageGroupsModal() { // Fecha o modal de gerenciamento dos groups se ele estiver visivel.
    if ($(".manage-groups_modal").is(":visible")) {
        $(".manage-groups_modal").css("transform", "translateY(-100vh)");

        setTimeout(() => {
            $(".manage-groups_modal").hide();
            $(".overlay").hide();
        }, 400);
    }
    if (reloadInClose) {
        location.reload();
    }
}

function requireUser(user_id) { // Função retorna o usuário pelo id.
    let user;

    $.ajax({
        url: url_api + "/usuarios/return_user",
        type: "POST",
        data: {
            id: user_id
        },
        async: false,
        success: (res) => {
            user = res.response;
        }
    });

    return user;
}

function closeNewProjectModal() { // Fecha o modal de novo projeto.
    if ($(".new-project-modal").is(":visible")) {
        $(".new-project-modal").css("transform", "translateY(-100vh)");

        setTimeout(() => {
            $(".new-project-modal").hide();
            $(".overlay").hide();

            if ($("#projects-name").val() != null) {
                $("#projects-name").val(findProjectNameById(getCurrentProjectIdInSessionStorage()).nome);
            }
        }, 400);
    }
}

function fillAppVersion() { //Preenche a variável de versão do sistema conforme o valor vindo do servidor.
    $.ajax({
        url: url_api + "/system",
        type: "GET",
        async: false,
        success: (res) => {
            app_version = res.response.system_version;
            $(".app-version").html(app_version); //Insere a versão do app.
        },
        complete: () => {
            setTimeout(() => {
                checkSystemVersion();
            }, 20000);
        }
    })
};

function checkSystemVersion() { // Verifica se houve uma alteração na versão do software, em caso positivo a mensagem de nova versão é exibida.
    $.ajax({
        url: url_api + "/system",
        type: "GET",
        success: (res) => {
            if (res.response.system_version != app_version) {
                $(".new-version-availabe").show();
            };
        },
        complete: () => {
            setTimeout(() => {
                checkSystemVersion(app_version);
            }, 20000); // Chamada recursiva da função a cada 20 segundos.
        }
    })
};

function fillUserImage() { // Função para preencher a imagem do usuário logado.
    let user = requireUser(getUserIdInLocalStorage());
    $(".user-name").html(user.nome);

    if (user.profile_photo == "") {
        user.profile_photo = url_api + "/public/default-user-image.png"; // Se o usuário não tiver foto, uma imagem padrão do servidor é colocada.
    }

    $(".avatar-header").attr("src", user.profile_photo); // É alterado o src da imagem do header.

    setTimeout(fillUserImage, 36000); // Chamada recursiva da função a cada 36 segundos.
}

function generateNumberOs(number) { // Função para gerar número completo da OS com base no ano e no mês atual, além do próprio id da OS em banco.
    let date = new Date();
    let year = date.getFullYear().toString().slice(-2);
    let month = date.getMonth() + 1;
    let numberOs = "";

    if (number > 99) {
        let numberDivision = Math.round(number / 100);
        let finalNumber = number - (numberDivision + "00");

        month += numberDivision;
        numberOs = finalNumber;
    } else {
        numberOs = number;
    }
    if (month > 99) {
        let numberDivision = Math.round(month / 100);
        let finalNumber = month - (numberDivision + "0");

        year += numberDivision;
        numberOs = finalNumber;
    }
    if (month < 10) {
        month = "0" + month;
    }
    if (number < 10) {
        numberOs = `0${number}`;
    } 

    return parseInt(`${year}${month}${numberOs}`);
};

function resetOsFields(field1, field2, field3, field4) { // Função para resetar os campos do kanban.
    $(field1).html("");
    $(field2).html("");
    $(field3).html("");
    $(field4).html("");
};

function findOS(id) { // Função para encontrar a OS solicitada pelo ID da mesma.
    let os;

    $.ajax({
        url: url_api + "/os/find",
        data: {
            id_os: id
        },
        type: "POST",
        async: false,
        success: (res) => {
            os = res.response.os_list
        }
    });

    return os[0];
};

function findPriority(priority, badge = 0) { // Função para encontrar as classes dos badges da OS segundo a prioridade dela.
    switch (priority) {
        case 1: 
            if (badge == 1) { return "normal" };
            return "Normal";
        case 2: 
            if (badge == 1) { return "priority" };
            return "Prioritário";
    };
};

function getAllOs(fill = false) { // Função recupera a lista de OS do banco de dados.
    if (!in_drag) { // Se não estiver arrastando uma OS faz uma nova requisição
        let mainArrayOs;

        $.ajax({
            url: url_api + "/os/return_os_list",
            data: {
                id: getCurrentProjectIdInSessionStorage()
            },
            type: "POST",
            success: (res) => {
                mainArrayOs = res.response.os_list;
                if (mainArrayOs == null) { // Se não vier nada do banco de dados, assume um array vazio.
                    mainArrayOs = [];
                }
            },
            complete: () => {
                setOsInSessionStorage(mainArrayOs); // Insere o array de OS em session storage para facilitar a consulta.
                loadOs(mainArrayOs);
                if (!fill) {
                    setTimeout(getAllOs, 9000); // Chamada recursiva da requisição a cada 9 segundos.
                }
            }
        });
    } else {
        setTimeout(getAllOs, 9000); //Chamada recursiva da requisição se estiver arrastando uma OS.
    }
};

function setOsInSessionStorage(mainArrayOs) { // Armazena a lista de OS em session storage para consulta rápida.
    let array = JSON.stringify((mainArrayOs));
    sessionStorage.setItem("os_list", array);
}

function getOsFromSessionStorage() { // Recupera a lista de OS em session storage para consulta rápida.
    return JSON.parse(sessionStorage.getItem("os_list"));
}

function showTooltip(id, user_owner, priority, size) { // Função mostra o tooltip da respectiva OS sobreposta e preenche as informações.
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
            /*let osTooltipElement = `
                                    <div class="os-tooltip" id="#tooltip-${id}" style="${border}">
                                        <h6 class="os-tooltip-number"><strong>(OS) ${id}</strong></h6>
                                        <h6><strong>Aberta por:</strong> ${user_owner}</h6>
                                        <h6><strong>Tamanho:</strong> ${size}</h6>
                                        <h6><strong>Expira:</strong> Não</h6>
                                        <h6><strong>H. Previstas:</strong> n/a</h6>
                                        <h6><strong>H. Restantes:</strong> n/a</h6>
                                    </div>
                                `;*/
            let osTooltipElement = `
                                    <div class="os-tooltip" id="#tooltip-${id}" style="${border}">
                                        <h6 class="os-tooltip-number"><strong>${id}</strong></h6>
                                        <h6><strong>Aberta por:</strong> ${user_owner}</h6>
                                        <h6><strong>Tamanho:</strong> ${size}</h6>
                                    </div>
                                `;
            $(".card-os").append(osTooltipElement);
        }
    }
}

function hideTooltip() { // Reseta e esconde tooltip.
    $(".os-tooltip").attr("id", "");
    $(".os-tooltip").html("");
}

function turnOsDragabble() { // Acima de 865px de largura da tela, torna as OS arrastáveis.
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

function turnFieldDropable() { // Torna os campos do kanban aptos à aceitar OS que são arrastadas até eles e depois fazem uma chamada ajax para alterar o status da OS conforme a coluna do kanban.
    $(".col-scrum").droppable({
        drop: (event, ui) => {
            let jwt = "Bearer " + getJwtFromLocalStorage();
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

            for (let i in os_array) { // Faz o preenchimento do array de OS modificado antes da requisição para diminuir o delay e não causar bug visual.
                if (os_array[i].id_complete == current_os_id){
                    os_array[i].status_os = current_field;
                    loadOs(os_array);
                }
            }

            $.ajax({ // Requisição que atualiza o status da OS conforme o campo que ela jogou o card.
                url: url_api + "/os/os_status",
                headers: {
                    Authorization: jwt
                },
                async: false,
                type: "PATCH",
                data: {
                    id_complete: current_os_id,
                    status_os: current_field
                },
                success: () => { 
                    in_drag = false;
                    getAllOs(true);
                }
            });
        },
        hoverClass: "os-list-overlay"
    });
}

function loadOs(mainArrayOs) { // Função aloca as OS's conforme status no kanban.
    if (mainArrayOs == undefined) { // Se não existir nenhuma OS retorna a função.
        return;
    }

    resetOsFields("#col-to-do .os-list", "#col-doing .os-list", "#col-test .os-list", "#col-done .os-list"); // Reset dos campos do kanban.

    for (let i in mainArrayOs) {
        let card = `<a href="os-editar.html?id=${mainArrayOs[i].id_complete}&s=0" class="card-link" id="link-${mainArrayOs[i].id_complete}" draggable="false">
                        <div class="card-os" id="${mainArrayOs[i].id_complete}" onmouseenter="showTooltip('${mainArrayOs[i].id_complete}', '${mainArrayOs[i].user_owner}', '${mainArrayOs[i].priority}', '${mainArrayOs[i].size}')" onmouseleave="hideTooltip()">
                            <div class="card-os-header">
                                <h6><strong>${mainArrayOs[i].id_complete}</strong></h6>
                                <h6 class="sponsor-card-name"><strong>${mainArrayOs[i].sponsor}</strong></h6>
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

    if (window.location.pathname == app_name + "/index.html") { // Só executa as funções para mover as OS's de lugar se estiver na index.html, para evitar erros no console.
        turnOsDragabble();
        turnFieldDropable();
    }

    $(window).on("resize", () => {
        if (window.location.pathname == app_name + "/index.html") { // Só executa as funções para mover as OS's de lugar se estiver na index.html, para evitar erros no console (RESIZE).
            turnOsDragabble();
            turnFieldDropable();
        }
    });

    $("#new-os-1").on("click", () => { // Vai para a tela de criar nova OS com status A FAZER.
        newOsButton(1);
    });

    $("#new-os-2").on("click", () => { // Vai para a tela de criar nova OS com status FAZENDO.
        newOsButton(2);
    });

    $("#responsive-new-os-1").on("click", () => { // Vai para a tela de criar nova OS com status A FAZER.
        newOsButton(1);
    });

    $("#responsive-new-os-2").on("click", () => { // Vai para a tela de criar nova OS com status FAZENDO.
        newOsButton(2);
    });
};

function newOsButton(newOsStatus) {
    var url_os = new URL(system_url + "/os-editar.html");
    url_os.searchParams.append("s", newOsStatus);
    window.location.href = url_os;
}

$(".kanban").on("mouseleave", () => { // Se o mouse sair fora da div do kanban, significa que o usuário está tentando quebrar o layout e os campos são preenchidos novamente.
    in_drag = false;
    loadOs(getOsFromSessionStorage());
});

function excludeOs(param) { // Função exclui a OS solicitada através do ID.
    let currentOs = findOS(param);
    let jwt = "Bearer " + getJwtFromLocalStorage();

    if (currentOs == undefined) {
        $(".response").html("Não é possível excluir uma tarefa que não existe!");
    } else {
        $.ajax({
            url: url_api + "/os/delete_os",
            data: {
                id_os: param
            },
            headers: {
                Authorization: jwt
            },
            type: "DELETE",
            success: () => {
                window.location.href = app_name + "/index.html";
            }
        });
    };
};

function saveOs(os_number, priority, status, description, sponsor, user_owner, size, source) { // Função salva uma OS já existente através do ID.
    let jwt = "Bearer " + getJwtFromLocalStorage();

    if (source > 2000) { // Se o campo descrição tiver mais de 2000 caracteres, não é permitido salvar.
        return;
    };

    $.ajax({ // Requisição que atualiza a OS com o ID definido com os novos dados.
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
        success: () => {
            window.location.href = app_name + "/index.html";
        }
    });
};

function fillIdComplete(id_raw) { // Função cria o ID completo conforme o ID da OS retornada do banco e faz UPDATE da respectiva linha na tabela.
    let jwt = "Bearer " + getJwtFromLocalStorage();

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
        success: () => {
            window.location.href = app_name + "/index.html";
        }
    });
};

function createOs(priority, status, description, sponsor, user_owner, size, source) { // Função cria uma nova OS enviando dados dos inputs para o banco de dados.
    let jwt = "Bearer " + getJwtFromLocalStorage();

    if (source > 2000) { // Se o campo descrição tiver mais de 2000 caracteres, não é permitido salvar.
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
            size: size,
            group_id: getCurrentProjectIdInSessionStorage()
        },
        success: (res) => {
            fillIdComplete(res.os_criada.id_os); // Ao final da requisição de criação, a requisição de preenchimento do ID completo é disparada.
        }
    });
};

function countCharacters(source, target, response) { // Função conta os caracteres do campo de descrição de OS e retorna para a tela.
    let characters = $(source).val();
    let stringLength = characters.length;

    if (stringLength > 2000) {
        $(target).addClass("max-length");
        $(response).show();
    } else {
        $(target).removeClass("max-length");
        $(response).hide();
    }

    $(target).html(`${characters.length} / 2000 caracteres.`);
}

if ($(".edit-os").length) { // Funções que rodam a partir do momento que entra na tela 'os-editar.html'. //REVISAR ESSA FUNCAO
    if (getCurrentProjectIdInSessionStorage() == null) {
        logoutUser();
    } else {
        $.ajax({ // Requisição preenche o select de responsáveis com os nomes dos usuários cadastrados no banco.
            url: url_api + "/projects/return_group",
            type: "POST",
            data: {
               group_id: getCurrentProjectIdInSessionStorage() 
            },
            async: false,
            success: (res) => {
                for (let i in res.response.group_members_objects) {
                    let current_group_user = res.response.group_members_objects[i];
                    $("#sponsor").append(`<option value="${current_group_user.nome}">${current_group_user.nome}</option>`);
                    $("#owner").append(`<option value="${current_group_user.nome}">${current_group_user.nome}</option>`);
                }
            },
            error: () => {
                removeCurrentProjectIdInSessionStorage();
            }
        });

        let url = window.location.href;
        let paramValue1;
        let paramValue2;
        let param1excluded;
        let currentOs;
        let param1 = url.split("?");

        if (param1[1].indexOf("i") != -1) { // Se entrar aqui existe o parâmetro ID na url, faz o replace do parametro e usa para encontrar a OS correspondente.
            param1excluded = param1[1].split("&");
            paramValue1 = param1excluded[0].replace("id=", "");
            paramValue2 = param1excluded[1].replace("s=", "");
            currentOs = findOS(paramValue1);
        } else {
            paramValue2 = param1[1].replace("s=", ""); //  Se não somente o parametro S que indica em qual coluna do kanban ela foi criada.
        };
        if (paramValue1 != undefined) { // Se o parâmetro ID da url existir, ele pega o numero e coloca no campo id da OS.
            $("#so-number").val(paramValue1);
        };
        if (currentOs != undefined) { // Se entrar aqui é porque o usuário clicou para editar uma OS que já existe e preenche os dados dos campos.
            let current_project = getCurrentProjectIdInSessionStorage();

            if (currentOs.group_id != current_project) {
                window.location.href = app_name + "/not-allowed.html";
            }

            $("#sponsor").val(currentOs.sponsor);
            if ($("#sponsor").val() == null) {
                $("#sponsor").append(`<option value="excluded_user">Usuário excluído</option>`);
                $("#sponsor").val("excluded_user");
            }

            $("#status").val(currentOs.status_os);
            $("#priority").val(currentOs.priority);
            $("#description").val(currentOs.desc_os);
            $("#owner").val(currentOs.user_owner);

            if ($("#owner").val() == null) {
                $("#owner").append(`<option value="excluded_user">Usuário excluído</option>`);
                $("#owner").val("excluded_user");
            }
            
            $("#size").val(currentOs.size);
        } else {
            $("#status").val(paramValue2); // Se for uma nova OS, somente o valor do campo status é preenchido conforme o parâmetro da URL.
        };

        countCharacters("#description", ".count-characters", ".characters-response"); // Se inicia a contagem dos caracteres do campo descrição da OS.
        $("#description").on("keyup", () => { // Em todo evento keyup no input de descrição, a função countCharacters é chamada.
            countCharacters("#description", ".count-characters", ".characters-response");
        });

        $("#cancel-operation").on("click", () => { // Cancela o que estiver fazendo na tela de os-editar.html e redireciona para a index.
            window.location.href = app_name + "/index.html";
        });

        $("#exclude-os").on("click", () => { // Solicita a exclusão da OS atual.
            excludeOs(paramValue1);
        });

        $("#save-os").on("click", () => { // Salva a OS atual ou cria uma nova, se nenhum campo estiver vazio.
            if (getCurrentProjectIdInSessionStorage() == null) {
                logoutUser();
            } else {
                let os_number = $("#so-number").val();
                let priority = $("#priority").val();
                let status = $("#status").val();
                let description = $("#description").val();
                let sponsor = $("#sponsor").val();
                let user_owner = $("#owner").val();
                let source = $("#description").val().length;
                let size = $("#size").val();

                if (priority == "" || status == "" || description == "" || sponsor == "" || user_owner == "" || size == "") {
                    $(".response").html("Não foi possível salvar a tarefa, campos vazios.");
                } else {
                    $(".response").html("");
                    if (currentOs != undefined) {
                        saveOs(os_number, priority, status, description, sponsor, user_owner, size, source);
                    } else {
                        createOs(priority, status, description, sponsor, user_owner, size, source);
                    }
                };
            }
        });
    } 
};

function showPasswordToggleClass(element, older_class, new_class) { // Mostra ou esconde a senha.
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

if ($(".login").length) { // Funções para tela de login.
    let url = new URL(window.location);
    let time_out = url.searchParams.get("msg");
    let joined_group = url.searchParams.get("joined_group"); // Armazena os parâmetros da URL em variáveis.

    if (time_out != null) { // Se tiver o parametro time_out na url, o usuário é deslogado e direcionado para o login onde mostrará uma mensagem.
        removeCurrentProjectIdInSessionStorage();
        removeOsListFromSessionStorage();
        removeUserIdInLocalStorage();
        $(".response").html("Sessão expirada, faça login novamente");
        $(".response").css("display", "block");
    }

    
    let email = getEmailInLocalStorage(); //Pega o email que foi guardado em local storage se existir.
    let temp_email = getTemporaryEmail();

    if (temp_email != undefined) { // Se existir um email temporário, significa que o usuário está vindo da tela de cadastro, e mesmo que exista email no local storage para ser lembrado, o email vindo do registro tem prioridade.
        fillEmail(temp_email);
    } else {
        if (email != undefined) {
            fillEmail(email);
        }
    }
    removeTemporaryEmail(); // Após preencher o input, o email temporário é deletado.

    $("#user").on("keyup", () => { // Se o email no input não for igual ao que está em local storage, a opção de lembrar email é exibida.
        let currentEmail = $("#user").val();
        showRemember(email, currentEmail);
    });

    $("#password").on("keydown", () => { // Função exibe botão de mostrar senha quando existe algum valor no input de password.
        setTimeout(() => {
            if (!$("#password").val() == "") {
                $(".show-password").show();
            } else {
                $(".show-password").hide();
            };
        }, 10);
    });

    $(".show-password").on("click", () => { // Ao clicar no botão, mostra ou esconde a senha.
        showPasswordToggleClass(".show-password i", "fa-eye-slash", "fa-eye");
    });

    $("#login-form").on("submit", (e) => { // Função acontece quando dá submit do formulário de login.
        e.preventDefault();

        $("#login-form").find(".loading").html("");
        $("#login-form").find(".loading").hide();
        
        let data = $("#login-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
            obj[item.name] = item.value;
            return obj;
        }, {});

        if (data['remember'] == 'on') { setEmailInLocalStorage(data['email']); } // Se o usuário marcou a opção de lembrar o email, pega o email do input e armazena em local storage.

        $("#login-form").find(".form-input").attr("disabled", true);
        $("#login-form").find(".loading").show();
        $("#login-form").find('.response').hide();
        if ($("#password").attr("type") != "password") { // Antes de dar submit, o input é forçado a ficar do tipo password mesmo que o usuário tenha clicado para mostrar a senha.
            showPasswordToggleClass(".show-password i", "fa-eye-slash", "fa-eye");
        };

        $.ajax({ 
            url: url_api + "/system/maintenance",
            type: "GET",
            async: false,
            success: (res) => {
                if (!res.response.in_maintenance) {
                    $.ajax({
                        url: url_api + "/usuarios/login",
                        type: "POST",
                        data: data,
                        success: (res) => { //Se o usuário for autenticado, o token JWT e o ID são armazenados em local storage e redirecionado para index.html.
                            setJwtInLocalStorage(res.token);
                            setUserIdInLocalStorage(res.id_usuario);
                            if (joined_group != null) { // Se vier o parametro joined_group do registro, o login redireciona para a index e passa esse parâmetro para a exibição do modal.
                                window.location.href = app_name + "/index.html?joined_group=true";
                            } else {
                                window.location.href = app_name + "/index.html";
                            }
                        },
                        error: (xhr) => {
                            let error;
                            if (xhr.responseJSON.mensagem != undefined) {
                                error = xhr.responseJSON.mensagem
                            } else {
                                error = "Erro ao fazer login!";
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
                } else {
                    window.location.pathname = app_name + "/maintenance.html";
                }
            }
        });
        
        
    });
}

function setUserIdInLocalStorage(id_usuario) { // Armazena ID do usuário logado em local storage.
    localStorage.setItem("user_id", id_usuario); 
}

function removeUserIdInLocalStorage() { // Remove ID do usuário logado em local storage.
    localStorage.removeItem("user_id"); 
}

function getUserIdInLocalStorage() { // Recupera ID do usuário logado em local storage.
    return localStorage.getItem("user_id");;
}

function removeOsListFromSessionStorage() { // Remove a lista de OS de session storage.
    sessionStorage.removeItem("os_list");
}

function logoutUser() { // Função para deslogar usuário removendo JWT e ID de local storage e redirecionando para login.html
    removeOsListFromSessionStorage();
    removeCurrentProjectIdInSessionStorage();
    removeUserIdInLocalStorage();
    removeJwtFromLocalStorage();
    window.location.pathname = app_name + "/login.html"
}

function setEmailInLocalStorage(email) { // Se não existir um email em local storage ele armazena o que foi passado no parâmetro, se não ele sobrescreve o que já existia.
    localStorage.setItem("e-mail", email);
}

function getEmailInLocalStorage() { // Recupera o email de local storage.
    let email = localStorage.getItem('e-mail');
    if (email == undefined) { return ""; }
    return email;
}

function fillEmail(email) { // Pega o valor do parâmetro e preenche o campo email do formulário de login.
    $("#login-form").find("#user").val(email);
}

function showRemember(email1, email2) { // Mostra opção de lembrar email se os parâmetros passados na função forem diferentes.
    if (email1 == email2) { return; };
    $(".remember").css("display", "flex");
    return;
}

function getJwtFromLocalStorage() { // Recupera o token JWT de local storage.
    let jwt = localStorage.getItem("jwt_token");
    if (jwt == undefined) { return; }
    return jwt;
}

function setJwtInLocalStorage(token) { // Armazena o token JWT em local storage. 
    localStorage.setItem("jwt_token", token);
    return;
}

function matchPassword(password, repeatPassword) { // Função checka se as duas senhas são iguais, no registro.
    if (password == repeatPassword) {
        return true;
    }
    return false;
};

function setTemporaryEmail(email) { // Adiciona o email temporário em session storage.
    sessionStorage.setItem("temp_email", email);
}

function getTemporaryEmail() {
    return sessionStorage.getItem("temp_email"); // Recupera o email temporário de session storage.
}

function removeTemporaryEmail() { // Remove o email temporário em session storage.
    sessionStorage.removeItem("temp_email");
}

if ($(".register").length) { // Funções para tela de registro
    var url = new URL(document.location);
    let group_id = url.searchParams.get("gid"); // Pega todos os parâmetros da URL e armazena em variáveis.
    let token = url.searchParams.get("tk");
    let email = url.searchParams.get("email");

    $("#register-form #user").val(email); // Coloca o email no input do usuário se o mesmo for passado na URL.

    $("#register-form").on("submit", (e) => { // Funções quando dá o submit do formulário de registro.
        e.preventDefault();

        removeCurrentProjectIdInSessionStorage(); // Antes de registrar o usuário, desloga o usuário atual (se houver).
        removeOsListFromSessionStorage();
        removeUserIdInLocalStorage();

        let password = $("#password").val();
        let repeatPassword = $("#confirm_password").val();
        
        if (matchPassword(password, repeatPassword)) { // Se as duas senhas forem iguais, prossegue para o registro do usuário.
            let data = $("#register-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto
                obj[item.name] = item.value;
                return obj;
            }, {});
    
            $("#register-form").find(".form-input").attr("disabled", "disabled");
            $("#register-form").find(".loading").show();
            
            $.ajax({ // Faz a chamada para registro.
                url: url_api + "/usuarios/cadastro",
                type: "POST",
                async: false,
                data: data,
                success: (res) => { // No sucesso na requisição de cadastro redireciona para fazer o login.
                    setTemporaryEmail(data.email); // Seta o email temporário para ser preenchido no login.
                    setUserIdInLocalStorage(res.response.usuario_criado.id_usuario); // Coloca o id do usuário cadastrado em session storage.
                    createNewProjectFromRegister(res.response.usuario_criado.id_usuario); // Cria um novo projeto com base no nome do usuário cadastrado.
                    setTimeout(() => { // Depois de um tempo, adiciona o usuário cadastrado ao grupo recém criado.
                        if (group_id != null && token != null && email != null) {
                            addUserToGroup(group_id, token, res.response.usuario_criado.id_usuario, email);
                        }
                    }, 100);
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
                    var url_os = new URL(system_url + "/login.html");

                    $("#register-form").find(".response").addClass("success");
                    $("#register-form").find(".response").html("Usuário cadastrado!");
                    $("#register-form").find(".response").show();
                    $("#register-form").find(".form-input").attr("disabled", false);
                    $("#register-form").find(".loading").hide();

                    setTimeout(() => {
                        if (group_id != null && token != null && email != null) { // Se houver esses parâmetros, é direcionado para o login repassando o parâmetro joined_group.
                            url_os.searchParams.append("joined_group", true);
                        }
                        window.location.href = url_os;
                    }, 100);
                }
            });
        } else {
            $("#register-form").find(".response").html("Senhas não coincidem!");
            $("#register-form").find(".response").show();
        }
    });
};

if ($(".update-profile").length) { // Funções para tela de alteração do perfil.
    let id_usuario = getUserIdInLocalStorage();

    fillInformations("#nome", ".user-photo-inner", "#user-image", id_usuario); // Preenche a tela com as informações do usuário vindo do banco.

    let screenWidth = window.innerWidth;
    if (screenWidth > 950) { // Acima de 950px de largura da tela, o botão de excluir imagem (se existir) é escondido e só aparece no mouseover, se nãoele é sempre exibido.
        hideDeleteImage();
    } else {
        showDeleteImage();
    }

    $(window).on("resize", () => { // Faz o mesmo que na função acima mas quando acontece resize.
        screenWidth = window.innerWidth;
        if (screenWidth > 950) {
            hideDeleteImage();
        } else {
            showDeleteImage();
        }
    });

    $(".user-photo").on("mouseover", () => { // Mostra a opção de excluir imagem se for carregada uma imagem se a tela for maior que 950px.
        if (screenWidth > 950) {
            showDeleteImage();
        }
    });

    $(".user-photo").on("mouseout", () => {  // Esconde a opção de excluir imagem se a imagem for excluida se a tela for maior que 950px.
        if (screenWidth > 950) {
            hideDeleteImage();
        } 
    });

    $(document).on("click", e => { // Se clicar fora das opções da foto, ela fecha.
        let container = $(".user-photo-container");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $(".photo-options").hide();
        }
    })
    
    $(".delete-image").on("click", () => { // Remove a imagem atual do usuário.
        removeImage(id_usuario);
    });

    $(".user-photo-container").on("click", () => { // Abre mais opções da foto do usuário.
        togglePhotoOptions(".photo-options");
    });
    
    $(".show-photo").on("click", () => { // Abre um modal para ver a foto expandida.
        $(".photo-detail-container").show();
        $(".overlay").show();

        setTimeout(() => {
            $(".photo-detail-container").css("transform", "translateY(0)");
        }, 10);

        requireImage(id_usuario);
    });

    $(".upload-photo").on("click", () => { // Requisita o upload de uma nova imagem.
        sendPhoto();
    });

    $("#nome").on("keyup", () => { // Se usuário estiver editando o nome, o botão se salvar aparece.
        $("#update-profile-button").show();
    });

    $("#update-profile-button").on("click", () => { // Função ao clicar no botão de salvar.
        let name = $("#nome").val();

        if (name.length > 9) { // Limitação do nome do usuário
            $(".response").html("Limite atingido!");
            return;
        }
        
        let jwt = "Bearer " + getJwtFromLocalStorage();
        $.ajax({ // Faz o update do nome do usuário.
            url: url_api + "/usuarios/update_name",
            type: "POST",
            headers: {
                Authorization: jwt
            },
            data: {
                id: id_usuario,
                nome: name
            },
            success: () => {
                location.reload();
            }
        });
    });

    $(".delete-user-container").on("click", () => { // Se clicar no botão de excluir conta, o modal de confirmação de exclusão aparece.
        openExcludeUserModal();
    });

    $("#skip-exclude-confirmation").on("click", () => { //Se clicar no botão cancelar no modal de confirmação de exclusão, ele se fecha.
        closeExcludeAccountModal();
    });

    $("#exclude-account-confirmation-button").on("click", () => { // Se clicar no botão para confirmar a exclusão, a conta é excluída, o id da conta é retirado de todos os grupos que ela fazia parte, e os grupos dela são excluidos (Em uma versão futura será feita a inteligência para excluir apenas os grupos que o usuário a ser excluído é o único membro é deletado, se não outro usuário vira o dono do grupo, e o usuário que foi excluído é apenas retirado do grupo  ao qual ele era o dono).
        $(".deleting-message").show();
        $(".loading").show();
        excludeCurrentAccount(getUserIdInLocalStorage());
    });

    $("#photo").on("change", (e) => { // Funções para quando um novo arquivo é carregado no modal de envio de nova imagem.
        let formData = new FormData;

        $(".file-name").css("display", "flex");
        $(".response").html("");

        let filePath = $("#photo").val(); // Busca o nome o nome do arquivo e o exibe.
        let fileSplited = filePath.split('\\');
        let fileName = fileSplited[fileSplited.length - 1];
        $('.file-name').html(fileName);

        let file = e.target.files.item(0);

        if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { // Se o arquivo tiver um desses formatos (PNG, JPG E JPEG), a imagem é exibida no modal e é permitida a requisição para o servidor, se não aparece a mensagem (arquivo não suportado).
            let adress = new FileReader();

            $("#send-photo-button").show();
            formData.set("user_imagem", file);
            adress.readAsDataURL(file);
            adress.onloadend = () => {
                $(".image-preview").attr("src", adress.result);
                $(".photo-preview").css("display", "flex");
            };

            $("#send-photo-button").on("click", () => {
                uploadPhoto(id_usuario, formData); // Faz a requisição de upload de foto.
            });
        } else {
            $(".image-preview").attr("src", "");
            $(".photo-preview").css("display", "none");
            $(".response").html("Tipo de arquivo não suportado");
        }
    });
};

function excludeUser(user_id) { // Função exclui o usuário através do ID informado.
    let response;
    let jwt = "Bearer " + getJwtFromLocalStorage();
    $.ajax({
        url: url_api + "/usuarios/exclude_user",
        headers: {
            Authorization: jwt
        },
        type: "POST",
        async: false,
        data: {
            id_usuario: user_id 
        },
        success: (res) => {
            response = res.message;
        },
        error: (err) => {
            if (err) {
                response = err.responseJSON
            } else {
                response = "Erro ao excluir usuário!"
            }
        }
    });
    return response;
}

function excludeCurrentAccount(id_usuario) { // Função exclui o usuário dos grupos que ela fazia parte então exclui a conta em si.
    let user = requireUser(id_usuario);
    let userGroups;

    if (user.user_groups_id.length > 1)  {
        userGroups = user.user_groups_id.split(",");
    } else {
        userGroups = user.user_groups_id;
    }
    if (userGroups.length != 1) {
        for (let i in userGroups) {
            excludeUserFromProject(userGroups[i], id_usuario);
        }
    }

    excludeUser(id_usuario);
}

function openExcludeUserModal() { // Abre o modal de confirmação de exclusão.
    $(".delete-user-confirmation").show();
    $(".overlay").show();

    setTimeout(() => {
        $(".delete-user-confirmation").css("transform", "translateY(0)");
    }, 10);
}

function closeExcludeAccountModal() { // Fecha o modal de confirmação de exclusão.
    $(".delete-user-confirmation").css("transform", "translateY(-100vh)");

    setTimeout(() => {
        $(".delete-user-confirmation").hide();
        $(".overlay").hide();
    }, 400);
}

function closeImageModal() { // Fecha o modal de envio da imagem.
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

function fillInformations(element1, element2, element3, user_id) { // Preenche as informações da tela de update-profile.html com o que vem de banco.
    let user = requireUser(user_id);
    if (!user.profile_photo == "") {
        $(element2).html("");
        $("#user-image").show();
        $(".show-photo").show();
        $(element3).attr("src", user.profile_photo);
    }

    $(element1).val(user.nome);
};

function showDeleteImage() { // Mostra o botão de excluir a imagem.
    if ($("#user-image").attr("src") != undefined) {
        $(".delete-image").css("display", "flex");
        setTimeout(() => {
            $(".delete-image").css("transform", "translateY(0)");
        }, 10);
    };
}

function hideDeleteImage() { // Esconde o botão de excluir a imagem.
    if ($("#user-image").attr("src") != undefined) {
        $(".delete-image").css("transform", "translateY(30px)");
        setTimeout(() => {
            $(".delete-image").css("display", "none");
        }, 400);
    };
}

function togglePhotoOptions(element) { // Abre ou fecha as opções de quando clica na foto do usuário.
    if ($(element).is(":visible")) {
        $(element).css("display", "none");
    } else {
        $(element).css("display", "flex");
    }  
};

function uploadPhoto(id, formData) { // Função faz o upload da imagem em si para o servidor e então, fecha o modal e recarrega a página.
    let jwt = "Bearer " + getJwtFromLocalStorage();

    $(".response").html("");
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
        success: () => {
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

function sendPhoto() { // Abre o modal de envio de uma nova imagem.
    $(".upload").show();

    setTimeout(() => {
        $(".upload").css("transform", "translateY(0)");
    }, 10);
    
    $(".overlay").show();
}

function requireImage(id_usuario, user_object = "") { // Pega a URL da imagem do usuário no banco.
    let userImage;
    let user = "";

    if (user_object == "") {
        user = requireUser(id_usuario);
    } else {
        user = user_object;
    }

    if (user.profile_photo != "") {
        $(".photo-detail").attr("src", user.profile_photo);
        togglePhotoOptions(".photo-options");
        userImage = user.profile_photo;
    } else {
        userImage = url_api + "/public/default-user-image.png";
    }

    return userImage;
};

function removeImage(id_usuario) { // Função remove a URL da imagem do respectivo usuário no banco de dados e recarrega a página.
    let jwt = "Bearer " + getJwtFromLocalStorage();
    
    $.ajax({
        url: url_api + "/usuarios/remove_image",
        type: "PATCH",
        data: {
            id: id_usuario
        },
        headers: {
            Authorization: jwt
        },
        success: () => {
            location.reload();
        }
    });
}