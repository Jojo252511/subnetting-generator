/**
 * Author:  Jojo252511
 * 
 * @param {String} ip 
 * @param {String} subnetMask 
 * @returns 
*/

function calculateSubnet(ip, subnetMask) {
    // disassemble the IP address and subnet mask into parts
    const ipParts = ip.split('.').map(Number);
    const maskParts = subnetMask.includes('/') ? 
        Array(4).fill(0).map((_, i) => {
            const bits = Math.min(8, Math.max(0, parseInt(subnetMask.split('/')[1]) - i * 8));
            return 256 - Math.pow(2, 8 - bits);
        }) : 
        subnetMask.split('.').map(Number);

    // calculate network deals
    const networkParts = ipParts.map((part, index) => part & maskParts[index]);
    const subnet = networkParts.join('.');

    // Calculate Broadcast address
    const invertedMaskParts = maskParts.map(part => 255 - part);
    const broadcastParts = networkParts.map((part, index) => part | invertedMaskParts[index]);
    const broadcast = broadcastParts.join('.');

    // calculate the first and last IP address in the subnet
    const firstIpParts = [...networkParts];
    firstIpParts[3] += 1;
    const firstIp = firstIpParts.join('.');

    const lastIpParts = [...broadcastParts];
    lastIpParts[3] -= 1;
    const lastIp = lastIpParts.join('.');

    // return results
    return {
        subnet: subnet,
        mask: maskParts.join('.'),
        cidr: subnetMask.includes('/') ? subnetMask : '/' + maskParts.reduce((acc, part) => acc + part.toString(2).split('1').length - 1, 0),
        firstIp: firstIp,
        lastIp: lastIp,
        broadcast: broadcast
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const ipInput = document.getElementById('ipAddress');
    const maskInput = document.getElementById('subnetMask');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const ip = ipInput.value;
        const mask = maskInput.value;
        const result = calculateSubnet(ip, mask);
        // German output
        resultDiv.innerHTML = `
            <p>Netzadresse: ${result.subnet}</p>
            <p>Maske: ${result.mask}</p>
            <p>CIDR: ${result.cidr}</p>
            <p>Erste IP: ${result.firstIp}</p>
            <p>Letzte IP: ${result.lastIp}</p>
            <p>Broadcast: ${result.broadcast}</p>
        `;
    });
});
