const joinCommunityBtn = document.getElementById("joinCommunity");
const communityPopup = document.getElementById("communityPopup");
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const joinPopup = document.getElementById("joinPopup");
const createPopup = document.getElementById("createPopup");
const closeButtons = document.querySelectorAll(".close");

function closeAllPopups() {
    const popups = document.querySelectorAll(".popup");
    popups.forEach(popup => {
        popup.style.display = "none";
    });
  }


joinCommunityBtn.addEventListener("click", function() {
    closeAllPopups();
    communityPopup.style.display = "block";
});

joinBtn.addEventListener("click", function() {
    communityPopup.style.display = "none";
    joinPopup.style.display = "block";
});

createBtn.addEventListener("click", function() {
    communityPopup.style.display = "none";
    createPopup.style.display = "block";
});

closeButtons.forEach(button => {
    button.addEventListener("click", function() {
        button.closest(".popup").style.display = "none";
  });
});

joinSubmitBtn.addEventListener("click", function() {
    const communityCode = document.getElementById("communityCodeInput").value;

    if (communityCode) {
        const sessionID = getLocalStorageItem("sessionID");
        const isLocalConnection = window.location.hostname === "10.0.0.138";
        const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");
        const data = {
            purpose: "joinCommunity",
            username: username,
            sessionToken: sessionID,
            communityCode: communityCode
        };
    
        socket.onopen = function (event) {
            socket.send(JSON.stringify(data));
        };

        document.getElementById("communityCodeInput").value = "";

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data["purpose"] == "joinSuccess") {
                // do stuff
            }
            else if (data["purpose"] == "alreadyJoined") {
                // do stuff
            }
            else if (data["purpose"] == "communityNotFound") {
                // do stuff
            }
            else if (data["purpose"] == "fail") {
                alert("Session Invalid Or Expired");
                window.location.href = "../signIn/signIn.html";
            }

            socket.close(1000, "Closing Connection");
        };
    }
    else {
        alert("Please enter a community code.");
    }
});
  

createSubmitBtn.addEventListener("click", function() {
    const communityName = document.getElementById("communityNameInput").value;

    if (communityCode) {
        const sessionID = getLocalStorageItem("sessionID");
        const isLocalConnection = window.location.hostname === "10.0.0.138";
        const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");
        const data = {
            purpose: "createCommunity",
            username: username,
            sessionToken: sessionID,
            communityName: communityName
        };
    
        socket.onopen = function (event) {
            socket.send(JSON.stringify(data));
        };

        document.getElementById("communityCodeInput").value = "";

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data["purpose"] == "createSuccess") {
                // do stuff
            }
            else if (data["purpose"] == "fail") {
                alert("Session Invalid Or Expired");
                window.location.href = "../signIn/signIn.html";
            }

            socket.close(1000, "Closing Connection");
        };
    }
    else {
        alert("Please enter a community name.");
    }
});

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorageItem(key) {
    return localStorage.getItem(key);
}