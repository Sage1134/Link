const sessionID = getLocalStorageItem("sessionID");
const username = getLocalStorageItem("username");

const joinCommunityBtn = document.getElementById("joinCommunity");
const communityPopup = document.getElementById("communityPopup");
const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");
const joinPopup = document.getElementById("joinPopup");
const createPopup = document.getElementById("createPopup");
const postPopup = document.getElementById("postPopup");
const profileTagsPopup = document.getElementById("profileTagsPopup");
const closeButtons = document.querySelectorAll(".close");
const communitiesPage = document.getElementById("communities");
const communityInfoPage = document.getElementById("communityInfo");
const postButton = document.getElementById("postButton");
const linkButton = document.getElementById("linkButton");
const homeButton = document.getElementById("homeButton");
const linkPopup = document.getElementById("linkPopup");
const matches = document.getElementById("matches");
const communityButton = document.getElementById("communityButton");
const peopleButton = document.getElementById("peopleButton");
const peopleDiv = document.getElementById("people");
const peoplePopup = document.getElementById("peoplePopup")
const localIP = "10.13.207.28";
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
    localStorage.removeItem("currentCommunity");
    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
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
        } else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updateCommunitiesUI(communities) {
    communitiesPage.style.display = "Flex";
    communityInfoPage.style.display = "None";
    communitiesPage.innerHTML = "";

    postButton.style.display = "None";
    joinCommunityBtn.style.display = "Block";

    communities.forEach(community => {
        const communityElement = document.createElement("div");
        communityElement.classList.add("community-box");
        communityElement.textContent = community.communityName;
        communityElement.dataset.communityCode = community.communityCode;

        communityElement.addEventListener("click", function() {
            const communityCode = this.dataset.communityCode;
            const isLocalConnection = window.location.hostname === localIP;
            const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");

            const data = {
                purpose: "getCommunityExtracurriculars",
                username: username,
                sessionToken: sessionID,
                communityCode: communityCode
            };

            setLocalStorageItem("currentCommunity", communityCode);

            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.purpose === "fetchSuccess") {
                    communitiesPage.style.display = "None";
                    communityInfoPage.style.display = "Block";

                    fetchCommunityExtracurriculars();
                } else if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                socket.close(1000, "Closing Connection");
            };
        });

        communitiesPage.appendChild(communityElement);
    });
}

peopleButton.addEventListener("click", function() {
    const currentCommunity = getLocalStorageItem("currentCommunity");

    if (currentCommunity == undefined || currentCommunity == null) {
        alert("Open a community page!");
    }
    else {
        closeAllPopups();
        fetchCommunityPeople();
    }
});

function fetchCommunityPeople() {
    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
    const communityCode = getLocalStorageItem("currentCommunity");

    const data = {
        purpose: "getPeople",
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
            updatePeopleUI(data.people);
        } else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function updatePeopleUI(people) {
    peoplePopup.style.display = "Block";

    people.forEach(person => {
        const personElement = document.createElement("div");
        personElement.classList.add("person-box");
        personElement.textContent = person.username;

        peopleDiv.appendChild(personElement);
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
            const isLocalConnection = window.location.hostname === localIP;
            const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");

            const data = {
                purpose: "getCommunityExtracurriculars",
                username: username,
                sessionToken: sessionID,
                communityCode: communityCode
            };

            setLocalStorageItem("currentCommunity", communityCode);

            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.purpose === "fetchSuccess") {
                    communitiesPage.style.display = "None";
                    communityInfoPage.style.display = "Block";

                    fetchCommunityExtracurriculars();
                } else if (data.purpose == "fail") {
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
    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
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
        } else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }
        socket.close(1000, "Closing Connection");
    };
}

function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

function showNotification(message, duration) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.classList.add("notification");
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
}

function updateExtracurricularsUI(extracurriculars) {
    const communityInfoDiv = document.getElementById("communityInfo");
    const currentCommunity = getLocalStorageItem("currentCommunity")
    communityInfoDiv.innerHTML = "";

    const newParagraph = document.createElement("p");
    newParagraph.textContent = "Community Code: " + currentCommunity;
    newParagraph.classList.add("community-code")

    newParagraph.addEventListener("click", function() {
        copyToClipboard(currentCommunity);
        showNotification("Code copied to clipboard!", 1500);
    });

    communityInfoDiv.appendChild(newParagraph);

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
        tagsElement.textContent = extracurricular.tags.length > 0 ? "Tags: " + extracurricular.tags.join(", ") : "Tags: None";

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

    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
    const data = {
        purpose: "joinCommunity",
        username: username,
        sessionToken: sessionID,
        communityCode: communityCode
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    document.getElementById("communityCodeInput").value = "";

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.purpose == "joinSuccess") {
            closeAllPopups();
            fetchUserCommunities();
        } else if (data.purpose == "alreadyJoined") {
            alert("You are already a part of this class!");
            document.getElementById("communityCodeInput").value = "";
        } else if (data.purpose == "communityNotFound") {
            alert("A community was not found with this code!");
            document.getElementById("communityCodeInput").value = "";
        } else if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        }

        socket.close(1000, "Closing Connection");
    };
});

createSubmitBtn.addEventListener("click", function() {
    const communityName = document.getElementById("communityNameInput").value;

    if (communityName) {
        const isLocalConnection = window.location.hostname === localIP;
        const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
        const data = {
            purpose: "createCommunity",
            username: username,
            sessionToken: sessionID,
            communityName: communityName
        };

        socket.onopen = function(event) {
            socket.send(JSON.stringify(data));
        };

        document.getElementById("communityCodeInput").value = "";

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data.purpose == "createSuccess") {
                closeAllPopups();
                fetchUserCommunities();
            } else if (data.purpose == "fail") {
                alert("Session Invalid Or Expired");
                window.location.href = "../signIn/signIn.html";
            }

            socket.close(1000, "Closing Connection");
        };
    } else {
        alert("Please enter a community name.");
    }
});

postSubmitBtn.addEventListener("click", function() {
    const communityCode = getLocalStorageItem("currentCommunity");
    const postTitle = document.getElementById("postTitle").value.trim();
    const postDescription = document.getElementById("postDescription").value.trim();

    if (communityCode && postTitle && postDescription) {
        const isLocalConnection = window.location.hostname === localIP;
        const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");
        const data = {
            purpose: "createPost",
            username: username,
            sessionToken: sessionID,
            communityCode: communityCode,
            postTitle: postTitle,
            postDescription: postDescription,
            tags: tagsList
        };

        socket.onopen = function(event) {
            socket.send(JSON.stringify(data));
        };

        document.getElementById("postTitle").value = "";
        document.getElementById("postDescription").value = "";
        document.getElementById("postTags").value = "";

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data.purpose == "postSuccess") {
                closeAllPopups();
                clearTagsList();
                document.getElementById("tagsContainer").innerHTML = "";
                fetchCommunityExtracurriculars();
            } else if (data.purpose == "fail") {
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
            if (tagsList.includes(tagInput.toLowerCase())) {
                alert("This tag already exists!");
            }
            else {
                const tagButton = document.createElement("button");
                tagButton.textContent = tagInput;
                tagButton.classList.add("tag-button");
                tagButton.addEventListener("click", function() {
                    removeTagFromList(tagButton.textContent);
                    this.remove();
                });
                document.getElementById("tagsContainer").appendChild(tagButton);
                addTagToList(tagButton.textContent.toLowerCase());
                this.value = "";
            }
        }
    }
});

document.getElementById("signOutButton").addEventListener("click", function() {
    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? 'ws://' + localIP + ':1134' : 'ws://99.246.0.254:1134');

    const data = {
        purpose: "signOut",
        username: username,
        sessionToken: sessionID,
    };

    socket.onopen = function(event) {
        socket.send(JSON.stringify(data));
    };

    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if (data.purpose == "fail") {
            alert("Session Invalid Or Expired");
            window.location.href = "../signIn/signIn.html";
        } else if (data.purpose == "signOutSuccess") {
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
});

document.getElementById("profileTagsBox").addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const tagInput = this.value.trim();

        if (tagInput !== "") {
            const isLocalConnection = window.location.hostname === '" + localIP + "';
            const socket = new WebSocket(isLocalConnection ? 'ws://' + localIP + ':1134' : 'ws://99.246.0.254:1134');

            const data = {
                purpose: "addTag",
                username: username,
                sessionToken: sessionID,
                tag: tagInput
            };

            socket.onopen = function(event) {
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function(event) {
                var data = JSON.parse(event.data);
                if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                } else if (data.purpose == "tagExists") {
                    alert("Your profile already has this tag!");
                } else if (data.purpose == "tagFail") {
                    alert("You entered an invalid tag!");
                } else if (data.purpose == "tagAddSuccess") {
                    document.getElementById("profileTagsBox").value = "";
                    fetchUserTags();
                }
                socket.close(1000, "Closing Connection");
            };
        }
    }
});

function fetchUserTags() {
    const isLocalConnection = window.location.hostname === localIP;
    const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");

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
        } else if (data.purpose == "fail") {
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
        const tagElement = document.createElement("button");
        tagElement.classList.add("profileTagBox");
        tagElement.textContent = tag;
        tagElement.dataset.tagName = tag;

        tagElement.addEventListener("click", function() {
            const isLocalConnection = window.location.hostname === localIP;
            const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");

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
                    fetchUserTags();
                } else if (data.purpose == "fail") {
                    alert("Session Invalid Or Expired");
                    window.location.href = "../signIn/signIn.html";
                }
                socket.close(1000, "Closing Connection");
            };
        });

        tagsDiv.appendChild(tagElement);
    });
}

homeButton.addEventListener("click", function() {
    fetchUserCommunities();
});

communitiesButton.addEventListener("click", function() {
    fetchUserCommunities();
});

linkButton.addEventListener("click", function() {
    const currentCommunity = getLocalStorageItem("currentCommunity");

    if (currentCommunity == undefined || currentCommunity == null) {
        alert("Open a community page!");
    }
    else {
        const isLocalConnection = window.location.hostname === localIP;
        const socket = new WebSocket(isLocalConnection ? "ws://" + localIP + ":1134" : "ws://99.246.0.254:1134");

        const data = {
            purpose: "link",
            username: username,
            sessionToken: sessionID,
            community: currentCommunity
        };

        socket.onopen = function(event) {
            socket.send(JSON.stringify(data));
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.purpose === "linkSuccess") {
                closeAllPopups();
                matches.innerHTML = "";
                linkPopup.style.display = "Block";

                data.matches.forEach(match => {
                    const matchElement = document.createElement("div");
                    matchElement.classList.add("post-box");
                    matchElement.classList.add("link-box");
            
                    const titleElement = document.createElement("h2");
                    titleElement.textContent = match.title;
            
                    const descriptionElement = document.createElement("p");
                    descriptionElement.textContent = match.description;
            
                    const tagsElement = document.createElement("p");
                    tagsElement.textContent = "Tags: " + match.tags.join(", ");

                    const scoreElement = document.createElement("p");

                    scoreElement.textContent = "Match Score: " + (match.score * 100).toFixed(2) + "%";
            
                    matchElement.appendChild(titleElement);
                    matchElement.appendChild(descriptionElement);
                    matchElement.appendChild(tagsElement);
                    matchElement.appendChild(scoreElement);
            
                    matches.appendChild(matchElement);
                });
            } else if (data.purpose == "missingTags") {
                alert("Add some tags to your profile first!")
            } else if (data.purpose == "missingPosts") {
                alert("No posts found in this community! Consider posting something.")
            } else if (data.purpose == "noMatchesFound") {
                alert("No matches found in this community!")
            } else if (data.purpose == "fail") {
                alert("Session Invalid Or Expired");
                window.location.href = "../signIn/signIn.html";
            }
            socket.close(1000, "Closing Connection");
        };
    }
})

window.addEventListener("load", fetchUserCommunities);

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

function getLocalStorageItem(key) {
    return localStorage.getItem(key);
}
