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
        console.log(e);
        console.log("<a href=" + localURl + "/r/" + e);
        document.getElementById("resultBox").innerHTML = "<a href=" + localURl + "/" + e + ">" + localURl + "/r/" + e + "</a>";
    });
    document.getElementById("urlInput").value = "";
});


document.getElementById("loginButton").addEventListener("click", function () {
    if (loginDone) return;
    console.log("TEST");
    login(document.getElementById("userNameInput").value, document.getElementById("passwordInput").value, function (e) {
        var data = JSON.parse(e);
        console.log(data);
        cookie.create("uName", data.name);
        cookie.create("uSession", data.tk);

        document.getElementById("loginButton").innerHTML = "Login Done";
        loginDone = true;
    });
});
