const teams = [];
let playerToTransfer = null;

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

function addTeam() {
    const name = document.getElementById('teamName').value.trim();
    const size = parseInt(document.getElementById('teamSize').value);
    const color = document.getElementById('teamColor').value;

    if (name && size > 0) {
        if (teams.some(team => team.name === name)) {
            showToast('Já existe um time com esse nome!', 'warning');
            return;
        }
        teams.push({ name, size, color, players: [] });
        renderTeams();
        document.getElementById('teamName').value = '';
        document.getElementById('teamSize').value = '';
        document.getElementById('teamColor').value = '#000000';
        showToast('Time adicionado com sucesso!', 'success');
    } else {
        showToast('Preencha o nome do time e a quantidade de jogadores corretamente!', 'danger');
    }
}

function distributePlayers() {
    const playerNames = document.getElementById('playerNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    if (playerNames.length === 0) {
        showToast('Insira os nomes dos jogadores!', 'warning');
        return;
    }

    const totalTeamSpots = teams.reduce((acc, team) => acc + team.size, 0);
    if (playerNames.length > totalTeamSpots) {
        showToast('O número de jogadores excede o total de vagas disponíveis nos times.', 'danger');
        return;
    }

    playerNames.sort(() => Math.random() - 0.5);
    teams.forEach(team => (team.players = []));

    let playerIndex = 0;
    teams.forEach(team => {
        while (team.players.length < team.size && playerIndex < playerNames.length) {
            team.players.push(playerNames[playerIndex++]);
        }
    });

    renderTeams();
    showToast('Jogadores sorteados com sucesso!', 'success');
    document.getElementById('sortGoalkeepersBtn').style.display = 'block';
}

function shuffleTeams() {
    // Coleta os nomes dos jogadores e goleiros diretamente dos inputs
    const playerNames = document.getElementById('playerNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    const goalkeeperNames = document.getElementById('goalkeeperNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    if (playerNames.length === 0) {
        showToast('Insira os nomes dos jogadores!', 'warning');
        return;
    }

    if (goalkeeperNames.length < teams.length) {
        showToast('Número insuficiente de goleiros para todos os times!', 'danger');
        return;
    }

    // Embaralha os jogadores e goleiros
    playerNames.sort(() => Math.random() - 0.5);
    goalkeeperNames.sort(() => Math.random() - 0.5);

    // Limpa os times antes de redistribuir
    teams.forEach(team => (team.players = []));

    // Atribui um goleiro a cada time
    teams.forEach((team, index) => {
        if (index < goalkeeperNames.length) {
            team.players.push(`🧤 ${goalkeeperNames[index]}`);
        }
    });

    // Distribui os jogadores de linha para preencher os times
    let playerIndex = 0;
    teams.forEach(team => {
        while (team.players.length < team.size && playerIndex < playerNames.length) {
            team.players.push(playerNames[playerIndex]);
            playerIndex++;
        }
    });

    renderTeams();
    showToast('Times e goleiros reembaralhados com sucesso!', 'info');
}

function clearTeams() {
    // Limpa os times, mas mantém a configuração original (nome, cor e tamanho)
    teams.forEach(team => (team.players = []));
    renderTeams();
    showToast('Times limpos! Pronto para um novo sorteio.', 'info');
}



let editablePlayer = null;

function renderTeams() {
    const container = document.getElementById('teamsContainer');
    container.innerHTML = '';

    teams.forEach((team, teamIndex) => {
        const goalkeepers = team.players.filter(player => player.startsWith('🧤'));
        const linePlayers = team.players.filter(player => !player.startsWith('🧤'));

        container.innerHTML += `
            <div class="col-md-4">
                <div class="card team-card" style="border-color: ${team.color}; background-color: ${team.color};">
                    <div class="card-header" style="color: white;">
                        ${team.name} (${team.players.length}/${team.size})
                    </div>
                    <div class="card-body">
                        <h6 class="text-white">GOL:</h6>
                        <ul class="list-group mb-3">
                            ${goalkeepers.map((player, playerIndex) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${renderPlayerName(player, teamIndex, playerIndex)}
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-info" onclick="openTransferModal(${teamIndex}, ${playerIndex})">
                                            Transferir
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="enableEditing(${teamIndex}, ${playerIndex})">
                                            Editar
                                        </button>
                                    </div>
                                </li>`).join('')}
                        </ul>

                        <h6 class="text-white">Linha:</h6>
                        <ul class="list-group">
                            ${linePlayers.map((player, playerIndex) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${renderPlayerName(player, teamIndex, goalkeepers.length + playerIndex)}
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-info" onclick="openTransferModal(${teamIndex}, ${goalkeepers.length + playerIndex})">
                                            Transferir
                                        </button>
                                        <button class="btn btn-sm btn-warning" onclick="enableEditing(${teamIndex}, ${goalkeepers.length + playerIndex})">
                                            Editar
                                        </button>
                                    </div>
                                </li>`).join('')}
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

function sortGoalkeepers() {
    let goalkeeperNames = document.getElementById('goalkeeperNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);

    if (goalkeeperNames.length === 0) {
        showToast('Insira os nomes dos goleiros!', 'warning');
        return;
    }

    // Se houver menos goleiros do que times, repete os goleiros até preencher todos os times
    while (goalkeeperNames.length < teams.length) {
        goalkeeperNames = goalkeeperNames.concat(goalkeeperNames);
    }

    // Limita os goleiros ao número de times e embaralha
    goalkeeperNames = goalkeeperNames.slice(0, teams.length);
    goalkeeperNames.sort(() => Math.random() - 0.5);

    // Atribui os goleiros aos times
    teams.forEach((team, index) => {
        team.players = [`🧤 ${goalkeeperNames[index]}`, ...team.players.filter(p => !p.startsWith('🧤'))];
    });

    renderTeams();
    showToast('Goleiros sorteados (incluindo repetidos, se necessário) com sucesso!', 'success');
    document.getElementById('sortGoalkeepersBtn').style.display = 'none';
}


function updatePlayerCount() {
    const playerNames = document.getElementById('playerNames').value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name);
    const count = playerNames.length;
    document.getElementById('playerCount').textContent = `${count} jogador(es) adicionado(s)`;
}