function signIn(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = {
        purpose: "signIn",
        username: username,
        password: password,
      };

    const isLocalConnection = window.location.hostname === "10.0.0.138";
    const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

    socket.onopen = function (event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data["purpose"] == "success") {
            window.location.replace(data["redirect"]);
            setLocalStorageItem("sessionID", data["sessionToken"]);
            setLocalStorageItem("username", username);
        }
        else if (data["purpose"] == "fail"){
            alert("Invalid Username Or Password!")
        }

        socket.close(1000, "Closing Connection");

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    };
}

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}