// Handle the "Next" button click
function nextStep() {
    var username = document.getElementById("username").value;
    if (username) {
        localStorage.setItem("username", username);  // Save username to local storage
        document.getElementById("username-section").classList.add("hidden");
        document.getElementById("team-section").classList.remove("hidden");
    } else {
        alert("Please enter a valid username.");
    }
}

// Handle form submission
function submitData() {
    var username = localStorage.getItem("username");
    var teamName = document.getElementById("team-name").value;
    var teamNumber = document.getElementById("team-number").value;
    var defense = document.getElementById("defense").value;
    var strategy = document.getElementById("strategy").value;
    var effectiveness = document.getElementById("effectiveness").value;
    var driveSkill = document.getElementById("drive-skill").value;
    var scoring = document.getElementById("scoring").value;
    var consistency = document.getElementById("consistency").value;
    var notes = document.getElementById("notes").value;

    if (teamName && teamNumber && defense && strategy && effectiveness && driveSkill && scoring && consistency) {
        // Create an object with the form data
        var data = {
            username: username,
            teamName: teamName,
            teamNumber: teamNumber,
            defense: defense,
            strategy: strategy,
            effectiveness: effectiveness,
            driveSkill: driveSkill,
            scoring: scoring,
            consistency: consistency,
            notes: notes
        };

        // Use Fetch API to send data to the Flask backend
        fetch('https://backend-8i2m.onrender.com/submit', {  // Updated URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            alert("Data submitted successfully!");
            document.getElementById("team-section").classList.add("hidden");
            document.getElementById("username-section").classList.remove("hidden");
        })
        .catch((error) => {
            console.error("Error submitting data:", error);
            alert("There was an error submitting the data.");
        });
    } else {
        alert("Please fill in all fields.");
    }
}

// Handle the "Admin" button click to show admin login
function showAdmin() {
    document.getElementById("admin-login").classList.add("hidden");
    document.getElementById("admin-section").classList.remove("hidden");
}

// Handle admin password submission
function accessAdmin() {
    var password = document.getElementById("admin-password").value;
    if (password === "admin") {
        document.getElementById("admin-section").classList.add("hidden");
        document.getElementById("rankings-section").classList.remove("hidden");
        document.getElementById("clear-history-btn").classList.remove("hidden");
        fetchRankings();  // Load the rankings after successful login
    } else {
        alert("Invalid password.");
    }
}

// Fetch and display rankings from the Flask backend
function fetchRankings() {
    fetch('https://backend-8i2m.onrender.com/rankings')  // Updated URL
        .then(response => response.json())
        .then(data => {
            const rankingsBody = document.getElementById("rankings-body");
            rankingsBody.innerHTML = "";  // Clear existing table data

            data.forEach(entry => {
                const row = rankingsBody.insertRow();
                row.insertCell(0).innerText = entry.teamName;
                row.insertCell(1).innerText = entry.teamNumber;
                row.insertCell(2).innerText = entry.avgScore;
                row.insertCell(3).innerText = entry.highestScore;
                row.insertCell(4).innerText = entry.username;
                row.insertCell(5).innerText = entry.defense;
                row.insertCell(6).innerText = entry.strategy;
                row.insertCell(7).innerText = entry.effectiveness;
                row.insertCell(8).innerText = entry.driveSkill;
                row.insertCell(9).innerText = entry.scoring;
                row.insertCell(10).innerText = entry.consistency;
                row.insertCell(11).innerText = entry.notes;

                // Add a Delete button to the row
                const deleteCell = row.insertCell(12);
                const deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.onclick = () => deleteEntry(entry.teamNumber);  // Pass teamNumber to delete function
                deleteCell.appendChild(deleteButton);
            });
        })
        .catch((error) => {
            console.error("Error fetching rankings:", error);
        });
}

// Handle deletion of a specific entry
function deleteEntry(teamNumber) {
    if (confirm("Are you sure you want to delete this entry?")) {
        fetch('https://backend-8i2m.onrender.com/delete', {  // Updated URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamNumber: teamNumber })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Entry deleted successfully:', data);
            // Optionally, remove the row from the table
            const row = document.querySelector(`tr[data-team-number="${teamNumber}"]`);
            if (row) {
                row.remove();
            }
        })
        .catch((error) => {
            console.error("Error deleting entry:", error);
        });
    }
}

// Clear history (admin feature)
function clearHistory() {
    if (confirm("Are you sure you want to clear all data?")) {
        fetch('https://backend-8i2m.onrender.com/clear', {  // Updated URL
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            alert("History cleared!");
            fetchRankings();  // Refresh rankings after clearing history
        })
        .catch((error) => {
            console.error("Error clearing history:", error);
            alert("There was an error clearing the data.");
        });
    }
}
