function nextStep() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        localStorage.setItem('currentUser', username);
        document.getElementById('username-section').classList.add('hidden');
        document.getElementById('team-section').classList.remove('hidden');
    } else {
        alert('Please enter a username.');
    }
}

function submitData() {
    const username = localStorage.getItem('currentUser');
    const teamName = document.getElementById('team-name').value.trim();
    const teamNumber = document.getElementById('team-number').value.trim();
    const defense = parseInt(document.getElementById('defense').value) || 0;
    const strategy = parseInt(document.getElementById('strategy').value) || 0;
    const effectiveness = parseInt(document.getElementById('effectiveness').value) || 0;
    const driveSkill = parseInt(document.getElementById('drive-skill').value) || 0;
    const scoring = parseInt(document.getElementById('scoring').value) || 0;
    const consistency = parseInt(document.getElementById('consistency').value) || 0;
    const notes = document.getElementById('notes').value.trim();

    if (!teamName || !teamNumber) {
        alert('Please enter both the team name and number.');
        return;
    }

    const scores = { defense, strategy, effectiveness, driveSkill, scoring, consistency };
    const averageScore = (defense + strategy + effectiveness + driveSkill + scoring + consistency) / 6;
    const highestScore = Math.max(defense, strategy, effectiveness, driveSkill, scoring, consistency);

    const report = {
        username,
        teamName,
        teamNumber,
        scores,
        averageScore,
        highestScore,
        notes
    };

    let scoutingData = JSON.parse(localStorage.getItem('scoutingData')) || [];
    scoutingData.push(report);
    localStorage.setItem('scoutingData', JSON.stringify(scoutingData));

    alert('Submission saved!');
    document.getElementById('team-section').reset();
}

function showAdmin() {
    document.getElementById('admin-section').classList.remove('hidden');
}

function accessAdmin() {
    const password = document.getElementById('admin-password').value;
    if (password === 'Pusheen#99') {
        loadRankings();
        document.getElementById('rankings-section').classList.remove('hidden');
        document.getElementById('clear-history-btn').classList.remove('hidden');
    } else {
        alert('Incorrect password.');
    }
}

function loadRankings() {
    let scoutingData = JSON.parse(localStorage.getItem('scoutingData')) || [];
    scoutingData.sort((a, b) => b.averageScore - a.averageScore);

    const rankingsTable = document.getElementById('rankings-table').getElementsByTagName('tbody')[0];
    rankingsTable.innerHTML = '';

    scoutingData.forEach(entry => {
        const row = rankingsTable.insertRow();
        row.insertCell(0).textContent = entry.teamName;
        row.insertCell(1).textContent = entry.teamNumber;
        row.insertCell(2).textContent = entry.averageScore.toFixed(2);
        row.insertCell(3).textContent = entry.highestScore;
        row.insertCell(4).textContent = entry.username;
        
        // Detailed scores
        row.insertCell(5).textContent = entry.scores.defense;
        row.insertCell(6).textContent = entry.scores.strategy;
        row.insertCell(7).textContent = entry.scores.effectiveness;
        row.insertCell(8).textContent = entry.scores.driveSkill;
        row.insertCell(9).textContent = entry.scores.scoring;
        row.insertCell(10).textContent = entry.scores.consistency;
        
        // Notes column
        row.insertCell(11).textContent = entry.notes || "No notes";
    });
}

function clearHistory() {
    const confirmation = confirm('Are you sure you want to clear all team data?');
    if (confirmation) {
        localStorage.removeItem('scoutingData');
        alert('History cleared!');
        loadRankings();  // Reload the rankings table to show it's empty now
    }
}
