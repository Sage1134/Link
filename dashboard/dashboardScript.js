const sessionID = getLocalStorageItem("sessionID");
const username = getLocalStorageItem("username");

const joinCommunityBtn = document.getElementById("joinCommunity");
const communityPopup = document.getElementById("communityPopup");
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const joinPopup = document.getElementById("joinPopup");
const createPopup = document.getElementById("createPopup");
const postPopup = document.getElementById("postPopup");
const profileTagsPopup = document.getElementById("profileTagsPopup")
const closeButtons = document.querySelectorAll(".close");
const communitiesPage = document.getElementById("communities");
const communityInfoPage = document.getElementById("communityInfo");
const postButton = document.getElementById("postButton")

let tagsList = [];

function clearTagsList() {
    tagsList = [];
}

function addTagToList(tag) {
    if (tag !== "" && !tagsList.includes(tag)) {
        tagsList.push(tag);
    }
}

function removeTagFromList(tag) {
    const index = tagsList.indexOf(tag);
    if (index !== -1) {
        tagsList.splice(index, 1);
    }
}

function closeAllPopups() {
    const popups = document.querySelectorAll(".popup");
    popups.forEach(popup => {
        popup.style.display = "none";
    });
}

function fetchUserCommunities() {
    const isLocalConnection = window.location.hostname === "10.0.0.138";
    const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");
    const communityCode = getLocalStorageItem("currentCommunity");

    const data = {
        purpose: "getUserCommunities",
        username: username,
        sessionToken: sessionID,
        communityCode: communityCode
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.purpose === "fetchSuccess") {
            updateCommunitiesUI(data.communities);
            updateSidebar(data.communities);
        }
        else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updateCommunitiesUI(communities) {
    const communitiesDiv = document.getElementById("communities");
    communitiesDiv.style.display = "Flex";
    communityInfoPage.style.display = "None";
    communitiesDiv.innerHTML = "";

    postButton.style.display = "None";
    joinCommunityBtn.style.display = "Block";
    
    communities.forEach(community => {
        const communityElement = document.createElement("div");
        communityElement.classList.add("community-box");
        communityElement.textContent = community.communityName;
        communityElement.dataset.communityCode = community.communityCode;

        communityElement.addEventListener("click", function() {
            const communityCode = this.dataset.communityCode;
            const isLocalConnection = window.location.hostname === "10.0.0.138";
            const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

            const data = {
                purpose: "getCommunityExtracurriculars",
                username: username,
                sessionToken: sessionID,
                communityCode: communityCode
            };
            
            setLocalStorageItem("currentCommunity", communityCode)

            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.purpose === "fetchSuccess") {
                    communitiesPage.style.display = "None";
                    communityInfoPage.style.display = "Block";

                    fetchCommunityExtracurriculars()
                }
                else if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                socket.close(1000, "Closing Connection");
            };        
        });

        communitiesDiv.appendChild(communityElement);
    });
}

postButton.addEventListener("click", function() {
    clearTagsList();
    document.getElementById("tagsContainer").innerHTML = "";
    const postPopup = document.getElementById("postPopup");
    postPopup.style.display = "block";
});

function updateSidebar(joinedCommunities) {
    const communitiesSidebar = document.getElementById("communitiesSidebar");
    communitiesSidebar.innerHTML = "";

    joinedCommunities.forEach(community => {
        const communityButton = document.createElement("button"); 
        communityButton.textContent = community.communityName;
        communityButton.dataset.communityCode = community.communityCode;

        communityButton.addEventListener("click", function() {
            const communityCode = this.dataset.communityCode;
            const isLocalConnection = window.location.hostname === "10.0.0.138";
            const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

            const data = {
                purpose: "getCommunityExtracurriculars",
                username: username,
                sessionToken: sessionID,
                communityCode: communityCode
            };
            
            setLocalStorageItem("currentCommunity", communityCode)

            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.purpose === "fetchSuccess") {
                    communitiesPage.style.display = "None";
                    communityInfoPage.style.display = "Block";

                    fetchCommunityExtracurriculars();
                }
                else if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                socket.close(1000, "Closing Connection");
            };       
        });

        communitiesSidebar.appendChild(communityButton);
    });
}

function fetchCommunityExtracurriculars() {
    const isLocalConnection = window.location.hostname === "10.0.0.138";
    const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");
    const communityCode = getLocalStorageItem("currentCommunity");

    const data = {
        purpose: "getCommunityExtracurriculars",
        username: username,
        sessionToken: sessionID,
        communityCode: communityCode
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.purpose === "fetchSuccess") {
            updateExtracurricularsUI(data.extracurriculars);
        }
        else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updateExtracurricularsUI(extracurriculars) {
    const communityInfoDiv = document.getElementById("communityInfo");
    communityInfoDiv.innerHTML = "";

    joinCommunityBtn.style.display = "None";
    postButton.style.display = "Block";
    
    extracurriculars.forEach(extracurricular => {
        const postElement = document.createElement("div");
        postElement.classList.add("post-box");
    
        const titleElement = document.createElement("h2");
        titleElement.textContent = extracurricular.title;
    
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = extracurricular.description;
    
        const tagsElement = document.createElement("p");
        if (extracurricular.tags.length > 0) {
            tagsElement.textContent = "Tags: " + extracurricular.tags.join(", ");
        } else {
            tagsElement.textContent = "Tags: None";
        }
    
        postElement.appendChild(titleElement);
        postElement.appendChild(descriptionElement);
        postElement.appendChild(tagsElement);
    
        communityInfoDiv.appendChild(postElement);
    });
}

joinCommunityBtn.addEventListener("click", function() {
    closeAllPopups();
    communityPopup.style.display = "block";
    fetchUserCommunities();
});

joinBtn.addEventListener("click", function() {
    communityPopup.style.display = "none";
    joinPopup.style.display = "block";
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
        if (data.purpose == "joinSuccess") {
            fetchUserCommunities();
        }
        else if (data.purpose == "alreadyJoined") {
            console.log("already")
        }
        else if (data.purpose == "communityNotFound") {
            console.log("notFound")
        }
        else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }

        socket.close(1000, "Closing Connection");
    };
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
            if (data.purpose == "createSuccess") {
                fetchUserCommunities();
            }
            else if (data.purpose == "fail") {
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

postSubmitBtn.addEventListener("click", function() {
    const communityCode = getLocalStorageItem("currentCommunity");
    const postTitle = document.getElementById("postTitle").value.trim();
    const postDescription = document.getElementById("postDescription").value.trim();

    if (communityCode && postTitle && postDescription) {
        const isLocalConnection = window.location.hostname === "10.0.0.138";
        const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");
        const data = {
            purpose: "createPost",
            username: username,
            sessionToken: sessionID,
            communityCode: communityCode,
            postTitle: postTitle,
            postDescription: postDescription,
            tags: tagsList
        };

        socket.onopen = function (event) {
            socket.send(JSON.stringify(data));
        };

        document.getElementById("postTitle").value = "";
        document.getElementById("postDescription").value = "";
        document.getElementById("postTags").value = "";

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data.purpose == "postSuccess") {
                clearTagsList();
                document.getElementById("tagsContainer").innerHTML = "";
                fetchCommunityExtracurriculars();
            }
            else if (data.purpose == "fail") {
                alert("Session Invalid Or Expired");
                window.location.href = "../signIn/signIn.html";
            }

            socket.close(1000, "Closing Connection");
        };
    } else {
        alert("Please fill in all required fields.");
    }
});

document.getElementById("postTags").addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const tagInput = this.value.trim();
        if (tagInput !== "") {
            const tagButton = document.createElement("button");
            tagButton.textContent = tagInput;
            tagButton.classList.add("tag-button");
            tagButton.addEventListener("click", function() {
                removeTagFromList(tagButton.textContent);
                this.remove();
            });
            document.getElementById("tagsContainer").appendChild(tagButton);
            addTagToList(tagButton.textContent);
            this.value = "";
        }
    }
});

document.getElementById("signOutButton").addEventListener("click", function() {
    const isLocalConnection = window.location.hostname === '10.0.0.138';
    const socket = new WebSocket(isLocalConnection ? 'ws://10.0.0.138:1134' : 'ws://99.245.65.253:1134');

    const data = {
        purpose: "signOut",
        username: username,
        sessionToken: sessionID,
      };
    
    socket.onopen = function (event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        else if (data.purpose == "signOutSuccess") {
            localStorage.removeItem("username");
            localStorage.removeItem("sessionID");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");   
    };
});

document.getElementById("profileTagsButton").addEventListener("click", function() {
    closeAllPopups();
    profileTagsPopup.style.display = "block";
    fetchUserTags();
})

document.getElementById("profileTagsBox").addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const tagInput = this.value.trim();
        
        if (tagInput !== "") {
            const isLocalConnection = window.location.hostname === '10.0.0.138';
            const socket = new WebSocket(isLocalConnection ? 'ws://10.0.0.138:1134' : 'ws://99.245.65.253:1134');

            const data = {
                purpose: "addTag",
                username: username,
                sessionToken: sessionID,
                tag: tagInput
            };
            
            socket.onopen = function (event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                var data = JSON.parse(event.data);
                if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                else if (data.purpose == "tagAddSuccess") {
                    this.value = "";
                    updateTagsDisplay();
                }
                socket.close(1000, "Closing Connection");   
            };
        }
    }
});

function fetchUserTags() {
    const isLocalConnection = window.location.hostname === "10.0.0.138";
    const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

    const data = {
        purpose: "getUserTags",
        username: username,
        sessionToken: sessionID,
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.purpose === "fetchSuccess") {
            updateTagsDisplay(data.tags);
        }
        else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updateTagsDisplay(tags) {
    const tagsDiv = document.getElementById("profileTagsContainer");
    tagsDiv.innerHTML = "";
    
    tags.forEach(tag => {
        const tagElement = document.createElement("div");
        tagElement.classList.add("profileTagBox");
        tagElement.textContent = tag;
        tagElement.dataset.tagName = tag;

        tagElement.addEventListener("click", function() {
            const isLocalConnection = window.location.hostname === "10.0.0.138";
            const socket = new WebSocket(isLocalConnection ? "ws://10.0.0.138:1134" : "ws://99.246.0.254:1134");

            const data = {
                purpose: "deleteTag",
                username: username,
                sessionToken: sessionID,
                tag: this.dataset.tagName
            };
            
            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.purpose === "deleteSuccess") {
                    updateTagsDisplay();
                }
                else if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                socket.close(1000, "Closing Connection");
            };        
        });
    });
}

document.getElementById("homeButton").addEventListener("click", function() {
    fetchUserCommunities();
});


window.addEventListener("load", fetchUserCommunities);

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorageItem(key) {
    return localStorage.getItem(key);
}
