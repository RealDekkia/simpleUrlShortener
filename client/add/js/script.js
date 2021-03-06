//const localURl = "https://" + window.location.host;
const localURl = "http://localhost:8000";
var loginDone = false;

function addURL(url, name, sid, callback) {
    var request1 = new XMLHttpRequest();
    request1.open("GET", localURl + "/api/add");

    request1.setRequestHeader("long", url);
    request1.setRequestHeader("sid", sid);
    request1.setRequestHeader("name", name);
    request1.addEventListener('load', function (event) {
        if (request1.status >= 200 && request1.status < 300) {
            callback(request1.responseText);
        } else {
            console.warn(request1.statusText, request1.responseText);
        }
    });
    request1.send();
};

function login(name, password, callback) {
    var request1 = new XMLHttpRequest();
    request1.open("GET", localURl + "/api/login");

    request1.setRequestHeader("pw", password);
    request1.setRequestHeader("name", name);
    request1.addEventListener('load', function (event) {
        if (request1.status >= 200 && request1.status < 300) {
            callback(request1.responseText);
        } else {
            console.warn(request1.statusText, request1.responseText);
        }
    });
    request1.send();
};

document.getElementById("urlSend").addEventListener("click", function () {
    var url = document.getElementById("urlInput").value;
    addURL(url, cookie.get("uName"), cookie.get("uSession"), function (e) {
        document.getElementById("resultBox").innerHTML = "<a href=" + localURl + "/" + e + ">" + localURl + "/r/" + e + "</a>";
    });
    document.getElementById("urlInput").value = "";
});

document.getElementById("loginButton").addEventListener("click", function () {
    if (loginDone) return;
    login(document.getElementById("userNameInput").value, document.getElementById("passwordInput").value, function (e) {
        var data = JSON.parse(e);;
        cookie.create("uName", data.name);
        cookie.create("uSession", data.tk);

        disableLogin();
        listLast10Items();
    });
});

function checkLoginSession() {
    var request1 = new XMLHttpRequest();
    request1.open("GET", localURl + "/api/checkSession");

    request1.setRequestHeader("sid", cookie.get("uSession"));
    request1.setRequestHeader("name", cookie.get("uName"));
    request1.addEventListener('load', function (event) {
        if (request1.status >= 200 && request1.status < 300) {
            var data = JSON.parse(request1.responseText);
            if (data.tk != undefined) {
                cookie.create("uName", data.name);
                cookie.create("uSession", data.tk);
                disableLogin();
                listLast10Items();
            }
        } else {
            console.warn(request1.statusText, request1.responseText);
        }
    });
    request1.send();
};
checkLoginSession();

function disableLogin() {
    var button = document.getElementById("loginButton");
    var password = document.getElementById("passwordInput");
    var name = document.getElementById("userNameInput")

    loginDone = true;
    button.innerHTML = "Login Done";
    button.classList.add("disabledButton");
    password.value = "";
    password.disabled = true;
    name.value = cookie.get("uName");
    name.disabled = true;
}

function listLast10Items() {
    var request1 = new XMLHttpRequest();
    request1.open("GET", localURl + "/api/listurls");

    request1.setRequestHeader("sid", cookie.get("uSession"));
    request1.setRequestHeader("name", cookie.get("uName"));
    request1.setRequestHeader("limit", 10);
    request1.setRequestHeader("offset", 0);
    request1.addEventListener('load', function (event) {
        if (request1.status >= 200 && request1.status < 300) {
            var data = JSON.parse(request1.responseText);
            var box = document.getElementById("listBox");
            data.forEach(function (elem, ind) {
                console.log(elem);

                var li = document.createElement("div");
                li.className = "listItem";

                var sp0 = document.createElement("span");
                sp0.innerHTML = ind + 1;
                li.appendChild(sp0);

                var sp1 = document.createElement("span");
                sp1.innerHTML = elem.short;
                li.appendChild(sp1);

                var sp2 = document.createElement("span");
                sp2.innerHTML = elem.long;
                li.appendChild(sp2);

                var sp3 = document.createElement("span");
                var date = new Date(elem.crDate);

                sp3.innerHTML = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                li.appendChild(sp3);

                box.appendChild(li);

            });
        } else {
            console.warn(request1.statusText, request1.responseText);
        }
    });
    request1.send();
}
