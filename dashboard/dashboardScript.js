// Get elements
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

  
// Open confirmation popup when the button is clicked
joinCommunityBtn.addEventListener("click", function() {
    closeAllPopups();
    confirmationPopup.style.display = "block";
});

// Open join popup when "Join Community" button is clicked
joinBtn.addEventListener("click", function() {
    confirmationPopup.style.display = "none";
    joinPopup.style.display = "block";
});

// Open create popup when "Create Community" button is clicked
createBtn.addEventListener("click", function() {
    confirmationPopup.style.display = "none";
    createPopup.style.display = "block";
});

// Close popups when their close buttons are clicked
closeButtons.forEach(button => {
    button.addEventListener("click", function() {
        button.closest(".popup").style.display = "none";
  });
});