var networks; // Contiene tutte le possibili sottoreti determinate da una rete formato CIDR iniziale

/*
    SUBNETTING STATICO
*/
var selectElement = document.getElementById("cidrSubnettingSelect"); 

selectElement.addEventListener("change", function() { // LIstener evento change nel combobox

    var selectedValue = selectElement.value; // Ottiene l'indice del valore selezionati

    /*
        Crea le reti nel formato richiesto, viene riadattata la logica di calcolo del VLSM
    */
    const subnets = {};
    var nSubnet = networks[selectedValue][3]; // Numero di reti
    var fixedSize = networks[selectedValue][4] // Dimensione sottorete
    for (let i = 0; i < nSubnet; i++) { 
        subnets[i] = parseInt(fixedSize);
    }
    calculateSubnetting(subnets); // Calcola il subnetting

});

// Data una rete formato CIDR calcola tutte le possibili subnet
function findNetworks() {
    const majorNetwork = document.getElementById('subnettingStMajorNetInput').value; // rete principale
    const cidr = majorNetwork.split("/")[1];
    if(!validateIP(majorNetwork)){
        return;
    }
    networks = findPossibleNetworks(parseInt(cidr));
    populateSelectOptions(networks);
}

// "Popola" le opzioni del combobox (<select>)
function populateSelectOptions(networks) {
    const selectElement = document.getElementById('cidrSubnettingSelect');
    selectElement.innerHTML = '';

    for (let i = 0; i < networks.length; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${networks[i][1]} - ${networks[i][2]}`;
        selectElement.appendChild(option);
    }

    updateSubnetInfo();
}

function updateSubnetInfo() { // Inserisce le possibili subnet nel combobox
    const selectedIndex = document.getElementById('cidrSubnettingSelect').value;
    const subnetInfoElement = document.getElementById('subnetInfo');

    if (subnetInfoElement) {
        subnetInfoElement.innerHTML = `<h4>Selected Subnet Info:</h4>`;
        subnetInfoElement.innerHTML += `<p>CIDR: /${networks[selectedIndex][1]}</p>`;
        subnetInfoElement.innerHTML += `<p>Subnet Mask: ${networks[selectedIndex][2]}</p>`;
        subnetInfoElement.innerHTML += `<p>Number of Networks: ${networks[selectedIndex][3]}</p>`;
        subnetInfoElement.innerHTML += `<p>Number of Hosts: ${networks[selectedIndex][4]}</p>`;
    }
}

// Riadattando la logica per il calcolo del VLSM calcola il subnetting "fisso"
function calculateSubnetting(subnets) {
    const majorNetwork = document.getElementById('subnettingStMajorNetInput').value; // rete principale
    const output = calcVLSM(majorNetwork, subnets); // effettua il calcolo
    printResult(output); // Visualizza il risultato del calcolo
}


/*
    FUNZIONI PER VLSM
*/

// Genera le caselle di testo per la dimensione delle subnet (VLSM)
function generateSubnetInputs() {
    const numSubnets = document.getElementById('subnetInput').value;
    const subnetSizeInputs = document.getElementById('subnetSizeInputs');
    subnetSizeInputs.innerHTML = '';

    for (let i = 1; i <= numSubnets; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control';
        input.placeholder = `Enter Size for Subnet ${i}`;
        subnetSizeInputs.appendChild(input);
    }
}

// Calcola il VLSM e visualizza i risultati
function calculateVLSM() {
    const ip = document.getElementById('ipInput').value;

    if(!validateIP(ip)){
        return;
    }

    const numSubnets = parseInt(document.getElementById('subnetInput').value, 10);
    const subnetSizeInputs = document.getElementById('subnetSizeInputs');

    const cidr = parseInt(document.getElementById('ipInput').value.split("/")[1]);
    const subnets = {};
    var cnt = 0;

    for (let i = 0; i < numSubnets; i++) {
        const size = parseInt(subnetSizeInputs.children[i].value, 10);
        cnt += size;
        if(cnt > Math.pow(2,(32-cidr))){
            
            showErrorModal("Errore! Rete fornita non sufficientemente grande!");
            break;
        }else{
            subnets[i] = size;
        }
        
    }

    const majorNetwork = ip;
    const output = calcVLSM(majorNetwork, subnets);

    printResult(output);
}

function printResult(output){
    const resultsTableBody = document.getElementById('resultsTableBody');
    resultsTableBody.innerHTML = '';
    output.forEach(subnet => {
        const row = resultsTableBody.insertRow();
        row.innerHTML = `
            <td>${subnet.name}</td>
            <td>${subnet.allocatedSize}</td>
            <td>${subnet.address}</td>
            <td>${subnet.mask}</td>
            <td>${subnet.decMask}</td>
            <td>${subnet.rangeStart} - ${subnet.rangeEnd}</td>
            <td>${subnet.broadcast}</td>
        `;
    });
}

// Modal per messaggi di errore
function showErrorModal(errorMessage) {
    // Aggiorna il testo del messaggio di errore nel modal
    document.getElementById('errorMessage').innerText = errorMessage;

    // Mostra il modal
    $('#errorModal').modal('show');
}

// Verifica validità indirizzo fornito
function validateIP(addr){
    const regexp = /(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\/\d{1,2}/g;
    var match = addr.match(regexp);

    if(match != null){
        return true;
    }else{
        showErrorModal("Indirizzo non valido!");
        return false;
    }
}