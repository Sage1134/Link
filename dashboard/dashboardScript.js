const sessionID = getLocalStorageItem("sessionID");
const username = getLocalStorageItem("username");

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

function fetchUserCommunities() {
    const isLocalConnection = window.location.hostname === "10.0.0.138";
    const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

    const data = {
        purpose: "getUserCommunities",
        username: username,
        sessionToken: sessionID
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.purpose === "fetchSuccess") {

            updateCommunitiesUI(data.communities);
        }
        else if (data["purpose"] == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updateCommunitiesUI(communities) {
    const communitiesDiv = document.getElementById("communities");
    communitiesDiv.innerHTML = "";

    communities.forEach(community => {
        const communityElement = document.createElement("div");
        communityElement.classList.add("community-box");
        communityElement.textContent = community.communityName;

        communitiesDiv.appendChild(communityElement);
    });
}

joinCommunityBtn.addEventListener("click", function() {
    closeAllPopups();
    communityPopup.style.display = "block";
    fetchUserCommunities();fetchUserCommunities();fetchUserCommunities();fetchUserCommunities();fetchUserCommunities();fetchUserCommunities();fetchUserCommunities();
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
                fetchUserCommunities();
            }
            else if (data["purpose"] == "alreadyJoined") {
                console.log("already")
            }
            else if (data["purpose"] == "communityNotFound") {
                console.log("notFound")
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

    if (communityName) {
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
                fetchUserCommunities();
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

window.addEventListener("load", fetchUserCommunities);

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorageItem(key) {
    return localStorage.getItem(key);
}