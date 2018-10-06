//const localURl = "https://" + window.location.host;
const localURl = "http://localhost:8000";

function addURL(url, callback) {
    var request1 = new XMLHttpRequest();
    request1.open("GET", localURl + "/api/add");

    request1.setRequestHeader("long", url);
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
    addURL(url, function (e) {
        console.log(e);
        console.log("<a href=" + localURl + "/r/" + e);
        document.getElementById("resultBox").innerHTML = "<a href=" + localURl + "/r/" + e + ">" + localURl + "/r/" + e + "</a>";
    });
    document.getElementById("urlInput").value = "";
});
