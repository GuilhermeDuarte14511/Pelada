const teams = [];
let playerToTransfer = null;
let editablePlayer = null;

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

function toggleGoalkeeperInput() {
    const hasFixedGoalkeeper = document.getElementById('hasFixedGoalkeeper').checked;
    const goalkeeperInput = document.getElementById('goalkeeperNames');
    goalkeeperInput.disabled = !hasFixedGoalkeeper;
    goalkeeperInput.value = ''; // Limpa o campo se desabilitar
}

function generateTeams() {
    const playersPerTeam = parseInt(document.getElementById('playersPerTeam').value);
    const playerNames = document.getElementById('playerNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    const hasFixedGoalkeeper = document.getElementById('hasFixedGoalkeeper').checked;
    let goalkeeperNames = document.getElementById('goalkeeperNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    if (!playersPerTeam || playersPerTeam <= 0) {
        showToast('Informe a quantidade de jogadores por time.', 'warning');
        return;
    }

    if (playerNames.length === 0) {
        showToast('Adicione jogadores antes de gerar os times!', 'warning');
        return;
    }

    if (hasFixedGoalkeeper && goalkeeperNames.length === 0) {
        showToast('Informe pelo menos um goleiro fixo antes de gerar os times!', 'warning');
        return;
    }

    const totalTeams = Math.ceil(playerNames.length / playersPerTeam);

    teams.length = 0;
    playerNames.sort(() => Math.random() - 0.5);
    goalkeeperNames.sort(() => Math.random() - 0.5);

    if (hasFixedGoalkeeper) {
        while (goalkeeperNames.length < totalTeams) {
            const randomGoalkeeper = goalkeeperNames[Math.floor(Math.random() * goalkeeperNames.length)];
            goalkeeperNames.push(randomGoalkeeper);
        }
    }

    for (let i = 0; i < totalTeams; i++) {
        const playersForTeam = playerNames.splice(0, playersPerTeam);
        let goalkeeper = '';

        if (hasFixedGoalkeeper) {
            goalkeeper = `🧤 ${goalkeeperNames[i % goalkeeperNames.length]}`;
        }

        teams.push({
            name: `Time ${i + 1}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            players: playersForTeam,
            goalkeeper: goalkeeper
        });
    }

    renderTeams();
    showToast('Times gerados automaticamente!', 'success');
}

function renderTeams() {
    const container = document.getElementById('teamsContainer');
    container.innerHTML = '';

    teams.forEach((team, teamIndex) => {
        const isIncomplete = team.players.length < parseInt(document.getElementById('playersPerTeam').value);
        const cardClass = isIncomplete ? 'team-card incomplete' : 'team-card';

        const goalkeeperHTML = team.goalkeeper ? `
            <h6 class="text-white">Gol:</h6>
            <ul class="list-group mb-3">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${team.goalkeeper}</span>
                </li>
            </ul>` : '';

        const linePlayersHTML = team.players.map((player, playerIndex) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${playerIndex + 1} - ${renderPlayerName(player, teamIndex, playerIndex)}</span>
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="openTransferModal(${teamIndex}, ${playerIndex})">Transferir</button>
                    <button class="btn btn-sm btn-warning" onclick="enableEditing(${teamIndex}, ${playerIndex})">Editar</button>
                </div>
            </li>`).join('');

        container.innerHTML += `
            <div class="col-md-4">
                <div class="${cardClass}" style="border-color: ${team.color}; background-color: ${team.color};">
                    <div class="card-header" style="color: white;">
                        ${team.name} (${team.players.length} jogadores)
                    </div>
                    <div class="card-body">
                        ${goalkeeperHTML}
                        <h6 class="text-white">Linha:</h6>
                        <ul class="list-group">
                            ${linePlayersHTML}
                        </ul>
                    </div>
                </div>
            </div>`;
    });
}

function renderPlayerName(player, teamIndex, playerIndex) {
    if (editablePlayer?.teamIndex === teamIndex && editablePlayer?.playerIndex === playerIndex) {
        return `<input type="text" class="form-control player-input" value="${player}" 
                onblur="updatePlayerName(${teamIndex}, ${playerIndex}, this.value)" 
                onkeydown="if(event.key === 'Enter') this.blur()" autofocus />`;
    }
    return `<span class="player-name">${player}</span>`;
}

function enableEditing(teamIndex, playerIndex) {
    editablePlayer = { teamIndex, playerIndex };
    renderTeams();
}

function updatePlayerName(teamIndex, playerIndex, newName) {
    if (newName.trim()) {
        teams[teamIndex].players[playerIndex] = newName.trim();
        showToast('Nome do jogador atualizado com sucesso!', 'success');
    } else {
        showToast('Nome inválido! A edição foi cancelada.', 'warning');
    }
    editablePlayer = null;
    renderTeams();
}

function openTransferModal(teamIndex, playerIndex) {
    playerToTransfer = { teamIndex, playerIndex };
    const selectTeam = document.getElementById('selectTeam');
    selectTeam.innerHTML = '<option value="">Selecione um Time</option>';

    teams.forEach((team, index) => {
        if (index !== teamIndex) {
            selectTeam.innerHTML += `<option value="${index}">${team.name}</option>`;
        }
    });

    document.getElementById('teamPlayersList').innerHTML = '';
    selectTeam.addEventListener('change', loadTeamPlayers);
    const transferModal = new bootstrap.Modal(document.getElementById('transferModal'));
    transferModal.show();
}

function loadTeamPlayers() {
    const teamIndex = parseInt(document.getElementById('selectTeam').value);
    if (isNaN(teamIndex)) return;

    const team = teams[teamIndex];
    const list = document.getElementById('teamPlayersList');
    list.innerHTML = '<h5 class="text-white">Jogadores do Time Selecionado:</h5>';

    team.players.forEach((player, index) => {
        list.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-white">${player}</span>
                <button class="btn btn-sm btn-info" onclick="executeTransfer(${teamIndex}, ${index})">
                    Trocar com ${player}
                </button>
            </div>`;
    });
}

function updatePlayerCount() {
    const playerNames = document.getElementById('playerNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    const count = playerNames.length;
    document.getElementById('playerCount').textContent = `${count} jogador(es) adicionado(s)`;

    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Limpa a lista antes de adicionar os jogadores

    playerNames.forEach((name, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item show';
        listItem.innerHTML = `<span>${index + 1} - ${name}</span>`;
        playerList.appendChild(listItem);
    });
}

function executeTransfer(newTeamIndex, newPlayerIndex) {
    if (!playerToTransfer) return;

    const { teamIndex, playerIndex } = playerToTransfer;
    const oldTeam = teams[teamIndex];
    const newTeam = teams[newTeamIndex];

    [oldTeam.players[playerIndex], newTeam.players[newPlayerIndex]] = 
    [newTeam.players[newPlayerIndex], oldTeam.players[playerIndex]];

    playerToTransfer = null;
    renderTeams();
    bootstrap.Modal.getInstance(document.getElementById('transferModal')).hide();
    showToast('Jogadores trocados com sucesso!', 'success');
}