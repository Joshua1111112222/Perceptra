// Initialize forms count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateFormsCount();
});

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

// Handle form submission to local storage
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
            notes: notes,
            timestamp: new Date().toISOString()
        };

        // Save to local storage
        saveToLocalStorage(data);
        
        // Clear form
        document.getElementById("team-name").value = '';
        document.getElementById("team-number").value = '';
        document.getElementById("defense").value = '';
        document.getElementById("strategy").value = '';
        document.getElementById("effectiveness").value = '';
        document.getElementById("drive-skill").value = '';
        document.getElementById("scoring").value = '';
        document.getElementById("consistency").value = '';
        document.getElementById("notes").value = '';
        
        alert("Form saved locally! Click 'Upload' when ready to send to server.");
        document.getElementById("team-section").classList.add("hidden");
        document.getElementById("username-section").classList.remove("hidden");
    } else {
        alert("Please fill in all fields.");
    }
}

// Save data to local storage
function saveToLocalStorage(data) {
    let forms = JSON.parse(localStorage.getItem('savedForms') || '[]');
    forms.push(data);
    localStorage.setItem('savedForms', JSON.stringify(forms));
    updateFormsCount();
}

// Update the forms count display
function updateFormsCount() {
    let forms = JSON.parse(localStorage.getItem('savedForms') || '[]');
    document.getElementById('forms-count').textContent = forms.length;
}

// Upload all saved forms to the server
function uploadData() {
    let forms = JSON.parse(localStorage.getItem('savedForms') || '[]');
    
    if (forms.length === 0) {
        alert("No forms to upload!");
        return;
    }

    if (confirm(`Are you sure you want to upload ${forms.length} form(s) to the server?`)) {
        // Send each form to the server
        let uploadPromises = forms.map(form => {
            return fetch('https://backend-8i2m.onrender.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            });
        });

        // Wait for all uploads to complete
        Promise.all(uploadPromises)
            .then(responses => {
                // Check if all responses are OK
                const allSuccess = responses.every(response => response.ok);
                if (allSuccess) {
                    // Clear local storage if all uploads succeeded
                    localStorage.removeItem('savedForms');
                    updateFormsCount();
                    alert("All forms uploaded successfully!");
                } else {
                    throw new Error("Some forms failed to upload");
                }
            })
            .catch((error) => {
                console.error("Error uploading forms:", error);
                alert("There was an error uploading some forms. Please try again.");
            });
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