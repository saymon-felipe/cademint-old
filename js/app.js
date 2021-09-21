//Declaração de obojetos para teste
let users = [
    {
        id: 1,
        name: "Saymon"
    }
];

function loadOs() {
    let mainArrayOs = getAllOs();
    if (!mainArrayOs.length == 0) {
        for (let i in mainArrayOs) {
            let card = `<a href="os-editar.html?id=${mainArrayOs[i].id}&s=0" class="card-link">
                            <div class="card-os">
                                <div class="card-os-header">
                                    <h6>(OS) ${mainArrayOs[i].id}</h6>
                                    <h6 class="sponsor-name">${findUsers(mainArrayOs[i].sponsor).name}</h6>
                                </div>
                                <p class="os-description">
                                    ${mainArrayOs[i].description}
                                </p>
                                <div class="priority-container ${findPriority(mainArrayOs[i].priority, 1)}">
                                    <h6 class="priority-text">${findPriority(mainArrayOs[i].priority)}</h6>
                                </div>
                            </div>
                        </a>`;
            switch (mainArrayOs[i].status) {
                case "1":
                    $("#col-to-do .os-list").append(card);
                    continue;
                case "2":
                    $("#col-doing .os-list").append(card);
                    continue;
                case "3": 
                    $("#col-test .os-list").append(card);
                    continue;
                case "4":
                    $("#col-done .os-list").append(card);
                    continue;
            };
        };
    };
    

    //Criar nova OS
    $("#new-os-1").on("click", () => {
        window.location.href = `os-editar.html?id=${generateNumberOs()}&s=1`;
    })  ;
    $("#new-os-2").on("click", () => {
        window.location.href = `os-editar.html?id=${generateNumberOs()}&s=2`;
    });  
};

if ($(".edit-os").length) {
    let url = window.location.href;
    let param1 = url.split("?");
    let param1excluded = param1[1].split("&");
    let paramValue1 = param1excluded[0].replace("id=", "");
    let paramValue2 = param1excluded[1].replace("s=", "");
    let currentOs = findOS(paramValue1);
    $("#so-number").val(paramValue1);
    if (paramValue2 == 0) {
        $("#status").val(currentOs.status);
        $("#sponsor").val(currentOs.sponsor);
        $("#priority").val(currentOs.priority);
        $("#status").val(currentOs.status);
        $("#description").val(currentOs.description);
    } else {
        $("#status").val(paramValue2);
    };

    $("#cancel-operation").on("click", (e) => {
        e.preventDefault();
        window.location.href = "index.html";
    });
    $("#exclude-os").on("click", (e) => {
        e.preventDefault();
        let currentOs = findOS(paramValue1);
        if (currentOs == undefined) {
            $(".response").html("Não é possível excluir uma OS que não existe ainda!");
        } else {
            excludeOS(paramValue1);
            window.location.href = "index.html";
        }
    });
    $("#save-os").on("click", (e) => {
        e.preventDefault();
        if(currentOs == undefined) {
            let osId = $("#so-number").val();
            let sponsor = $("#sponsor").val();
            let priority = $("#priority").val();
            let status = $("#status").val();
            let description = $("#description").val();
            if (sponsor == "" || priority == "" || status == "" || description == "") {
                $(".response").html("Não foi possível salvar a OS, campos vazios.");
            } else { 
                $(".response").html("");
                newOs(osId, sponsor, priority, status, description); 
                window.location.href = "index.html";
            };
        } else {
            saveOs(currentOs.id);
            window.location.href = "index.html";
        };
    });
};

function saveOs(osId) {
    let sponsor = $("#sponsor").val();
    let priority = $("#priority").val();
    let status = $("#status").val();
    let description = $("#description").val();
    excludeOS(osId);
    newOs(osId, sponsor, priority, status, description); 
};

function newOs(val1, val2, val3, val4, val5) {
    let mainArrayOs = getAllOs();
    let osObject = {
        id: val1,
        sponsor: val2,
        priority: val3,
        status: val4,
        description: val5
    };
    mainArrayOs.push(osObject);
    setOs(mainArrayOs);
    
};

function generateNumberOs() {
    let date = new Date();
    let year = date.getFullYear().toString().slice(-2);
    let month = date.getMonth();
    let numberOs;
    let mainArrayOs = getAllOs();
    if (month < 10) {
        month = "0" + month;
    }
    if (mainArrayOs.length == 0) {
        numberOs = 1;
    } else {
       numberOs = mainArrayOs.length + 1;
    }
    if (numberOs < 10) {
        numberOs = "0" + numberOs; 
    }
    let newId = testIfIdExist(year + month + numberOs);
    return newId;
};

function testIfIdExist(id) {
    let mainArrayOs = getAllOs();
    console.log(mainArrayOs)
    for (let i in mainArrayOs) {
        console.log(mainArrayOs[i].id)
        if (mainArrayOs[i].id == id) {
            console.log("entrou")
            id++; 
        } ;
    };
    return id;
};

function findUsers(userId) {
    for (let i in users) {
        if (users[i].id == userId) {
            return users[i]
        };
    };
};

function findOS(id) {
    let mainArrayOs = getAllOs();
    for (let i in mainArrayOs) {
        if (mainArrayOs[i].id == id) {
            return mainArrayOs[i];
        };
    };
};

function excludeOS(id) {
    let mainArrayOs = getAllOs();
    for (let i in mainArrayOs) {
        if (mainArrayOs[i].id == id) {
            mainArrayOs.splice(i, 1);
        };
    };
    setOs(mainArrayOs);
};



function findPriority(priority, badge = 0) {
    switch (priority) {
        case "1": 
            if (badge == 1) { return "normal" };
            return "Normal";
        case "2": 
            if (badge == 1) { return "priority" };
            return "Prioritário";
    };
};

function getAllOs() {
    try {
        let arrayOsJson = localStorage.getItem("allOs");
        let mainArrayOs = JSON.parse(arrayOsJson);
        if (mainArrayOs == null) {
            mainArrayOs = [];
        }
        return mainArrayOs;
    }
    catch (e) {};
};

function setOs(object) {
    let arrayOsJson = JSON.parse(JSON.stringify(object));
    let arrayOs = JSON.stringify(arrayOsJson);
    localStorage.removeItem("allOs");
    localStorage.setItem("allOs", arrayOs);
};

