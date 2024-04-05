function register(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    const data = {
        purpose: "registration",
        username: username,
        password: password,
      };

    if (password === confirm) {
        const isLocalConnection = window.location.hostname === '10.0.0.138';
        const socket = new WebSocket(isLocalConnection ? 'ws://10.0.0.138:1134' : 'ws://99.246.0.254:1134');

        socket.onopen = function (event) {
            socket.send(JSON.stringify(data));
        };

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data["purpose"] == "registerResult") {
                alert(data["result"]);
            }
            socket.close(1000, "Closing Connection");
        };

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirm").value = "";
    }
    else {
        alert("Passwords do not match!")
    }
}