class Subnet {
    constructor() {
        this.name = "";
        this.neededSize = 0;
        this.allocatedSize = 0;
        this.address = "";
        this.mask = "";
        this.decMask = "";
        this.rangeStart = "";
        this.rangeEnd = "";
        this.broadcast = "";
    }
}

function sortMap(map) {
    const entries = Object.entries(map);
    entries.sort((a, b) => b[1] - a[1]); // ordine decrescente
    return Object.fromEntries(entries);
}

function convertQuartetToBinaryString(ipAddress) {
    const ip = ipAddress.split('.');
    let output = 0;
    ip.forEach((octet) => {
        output = (output << 8) + parseInt(octet);
    });
    return output;
}

function convertIpToQuartet(ipAddress) {
    const octet1 = (ipAddress >> 24) & 255;
    const octet2 = (ipAddress >> 16) & 255;
    const octet3 = (ipAddress >> 8) & 255;
    const octet4 = ipAddress & 255;
    return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

function findFirstIp(majorNetwork) {
    const [majorAddress, mask] = majorNetwork.split('/');
    const offset = 32 - parseInt(mask);

    const majorAddressBinary = convertQuartetToBinaryString(majorAddress);
    const firstIp = (majorAddressBinary >> offset) << offset;

    return firstIp;
}

function calcMask(neededSize) {
    const maskBits = 32 - Math.ceil(Math.log2(neededSize + 2)); // +2 per la rete e il broadcast
    return maskBits;
}

function findUsableHosts(mask) {
    return Math.pow(2, 32 - mask) - 2;
}

function toDecMask(mask) {
    if (mask === 0) {
        return "0.0.0.0";
    }
    const allOne = -1; // '255.255.255.255'
    const shifted = allOne << (32 - mask);

    return convertIpToQuartet(shifted);
}
/**
 * Funzione che calcola il VLSM
 * @param {string} networkAddress - Indirizzo di rete
 * @param {Array} subnets - Array che contiene le dimesioni delle subnet 
 * @returns {Array<Subnet>} - Restituisce l'array contenente le subnet calcolate
 */
function calcVLSM(majorNetwork, subnets) { // Calcolo VLSM
    const sortedSubnets = sortMap(subnets);
    const output = [];
    let currentIp = findFirstIp(majorNetwork);

    for (const [key, neededSize] of Object.entries(sortedSubnets)) {
        const subnet = new Subnet();

        subnet.name = key;
        subnet.address = convertIpToQuartet(currentIp);
        subnet.neededSize = neededSize;

        const mask = calcMask(neededSize);
        subnet.mask = `/${mask}`;
        subnet.decMask = toDecMask(mask);

        const allocatedSize = findUsableHosts(mask);
        subnet.allocatedSize = allocatedSize;

        const rangeStart = convertIpToQuartet(currentIp + 1); // Inizia dal 2° indirizzo (il primo è la rete)
        subnet.rangeStart = rangeStart;

        const rangeEnd = convertIpToQuartet(currentIp + allocatedSize - 0); // Termina con il penultimo indirizzo
        subnet.rangeEnd = rangeEnd;

        subnet.broadcast = convertIpToQuartet(currentIp + allocatedSize +1); // Broadcast sull'ultimo indirizzo
        currentIp += allocatedSize+2; // Passa alla prossima rete

        output.push(subnet);
    }

    return output;
}


/*
    TEST
*/
/*const majorNetwork = "192.168.1.0/24";
const subnets = {
    A: 50,
    B: 10,
    C: 20
};

const output = calcVLSM(majorNetwork, subnets);

output.forEach(subnet => {
    console.log(`${subnet.name}\t${subnet.neededSize}\t${subnet.allocatedSize}\t${subnet.address}\t${subnet.mask}\t${subnet.decMask}\t${subnet.rangeStart} - ${subnet.rangeEnd}\t${subnet.broadcast}`);
});
*/