/**
 * Funzione che calcola tutte le possibili sottoreti data una maschera CIDR
 * @param {number} networkAddress - maschera formato CIDR
 * @returns {Array<Subnet>} - Restituisce l'array contenente le subnet possibili
 */
function findPossibleNetworks(cidr) {
    let tmp = cidr + 1;
    let id = 0;
    let rows = [];
    let headers = ["ID", "CIDR", "Subnet Mask", "Reti", "Host"];
    rows.push(headers);

    do {
        let nBitPerRete = tmp - cidr;
        let reti = Math.pow(2, nBitPerRete);
        let nBitHost = (32 - cidr) - nBitPerRete;
        let host = Math.pow(2, nBitHost) - 2;

        rows.push([id.toString(), "/" + tmp.toString(), calculateDecMask(tmp).toString(), reti.toString(), host.toString()]);

        tmp += 1;
        id++;
    } while (tmp < 31);

    return rows;
}

// Funzione ausiliaria per calcolare la subnet mask in formato notazione punto-decimale
function calculateDecMask(cidr) {
    let decMask = 0xFFFFFFFF << (32 - cidr);
    return (decMask >>> 24) + '.' + ((decMask >> 16) & 255) + '.' + ((decMask >> 8) & 255) + '.' + (decMask & 255);
}