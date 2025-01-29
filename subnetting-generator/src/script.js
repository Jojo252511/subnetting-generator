/**
 * Author:  Jojo252511
 * 
 * @param {String} ip 
 * @param {String} subnetMask 
 * @returns 
*/
function calculateSubnet(ip, subnetMask) 
{
    const ipParts = ip.split('.').map(Number);
    const maskParts = subnetMask.includes('/') ? 
        Array(4).fill(0).map((_, i) => {
            const bits = Math.min(8, Math.max(0, parseInt(subnetMask.split('/')[1]) - i * 8));
            return 256 - Math.pow(2, 8 - bits);
        }) : 
        subnetMask.split('.').map(Number);

    const networkParts = ipParts.map((part, index) => part & maskParts[index]);
    const subnet = networkParts.join('.');

    const invertedMaskParts = maskParts.map(part => 255 - part);
    const broadcastParts = networkParts.map((part, index) => part | invertedMaskParts[index]);
    const broadcast = broadcastParts.join('.');

    const firstIpParts = [...networkParts];
    firstIpParts[3] += 1;
    const firstIp = firstIpParts.join('.');

    const lastIpParts = [...broadcastParts];
    lastIpParts[3] -= 1;
    const lastIp = lastIpParts.join('.');

    return {
        subnet: subnet,
        mask: maskParts.join('.'),
        cidr: subnetMask.includes('/') ? subnetMask : '/' + maskParts.reduce((acc, part) => acc + part.toString(2).split('1').length - 1, 0),
        firstIp: firstIp,
        lastIp: lastIp,
        broadcast: broadcast
    };
}

var buttonIndex = 0;

/**
 * Calculate more subnets
 * @param {String} subnet 
 * @param {String} cidr 
 * @returns {Object} result
 */
function moreSubnets(subnet, cidr, print = true) 
{
    const subnetParts = subnet.split('.').map(Number);
    const subnetSize = Math.pow(2, 32 - parseInt(cidr.split('/')[1]));

    let subnetInt = (subnetParts[0] << 24) | (subnetParts[1] << 16) | (subnetParts[2] << 8) | subnetParts[3];
    subnetInt += subnetSize;

    const nextSubnetParts = 
    [
        (subnetInt >> 24) & 255,
        (subnetInt >> 16) & 255,
        (subnetInt >> 8) & 255,
        subnetInt & 255
    ];

    const nextSubnet = nextSubnetParts.join('.');
    const result = calculateSubnet(nextSubnet, cidr);

    if (print) 
    {
        const buttonID_element = "button_" + buttonIndex;
        const button = document.getElementById(buttonID_element);
        if (button)
        {
            button.style.display = 'none';
        }
       setResults(result);
    }
    
   return result;
}

/**
 * set results to the result div
 * @param {Object} result 
 * @returns 
 */
function setResults(result, print = true) 
{
    const resultDiv = document.getElementById('result');

    if (result.subnet === "0.0.0.0") {
        console.log('No more Subnets available');
        resultDiv.innerHTML += `
            <p>No more Subnets available</p>
        `;
        return;
    }

    buttonIndex += 1;
    var buttonID = "button_" + buttonIndex;
    if (print) 
    {
        resultDiv.innerHTML += `
            <p>Netzadresse: ${result.subnet}</p>
            <p>Maske: ${result.mask}</p>
            <p>CIDR: ${result.cidr}</p>
            <p>Erste IP: ${result.firstIp}</p>
            <p>Letzte IP: ${result.lastIp}</p>
            <p>Broadcast: ${result.broadcast}</p>
            <hr>
            <button onclick="moreSubnets('${result.subnet}', '${result.cidr}')" id=${buttonID}>Calculate more subnets</button>
        `;
    } 
    
    else 
    {
        resultDiv.innerHTML += `
            <p>Netzadresse: ${result.subnet}</p>
            <p>Maske: ${result.mask}</p>
            <p>CIDR: ${result.cidr}</p>
            <p>Erste IP: ${result.firstIp}</p>
            <p>Letzte IP: ${result.lastIp}</p>
            <p>Broadcast: ${result.broadcast}</p>
            <hr>
        `;
    }
}

function isValidIp(ip) {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
}

document.addEventListener('DOMContentLoaded', () => 
{
    const ipInput = document.getElementById('ipAddress');
    const maskInput = document.getElementById('subnetMask');
    const resultDiv = document.getElementById('result');

    document.getElementById('generateButton').addEventListener('click', (event) => 
        {
            event.preventDefault();
            const ip = ipInput.value;
            const mask = maskInput.value;
            const result = calculateSubnet(ip, mask);
            if (!isValidIp(ip)) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML += `
                   <p style="color: red;">Please enter a valid IP address.</p>
                `;
                return;
            }
            buttonIndex += 1;
            var buttonID = "button_" + buttonIndex;
            resultDiv.innerHTML = `
                <p>Netzadresse: ${result.subnet}</p>
                <p>Maske: ${result.mask}</p>
                <p>CIDR: ${result.cidr}</p>
                <p>Erste IP: ${result.firstIp}</p>
                <p>Letzte IP: ${result.lastIp}</p>
                <p>Broadcast: ${result.broadcast}</p>
                <hr>
                <button onclick="moreSubnets('${result.subnet}', '${result.cidr}')" id=${buttonID}>Calculate more subnets</button>
            `;
        }
    );

    document.getElementById('generateAllButton').addEventListener('click', (event) => 
        {
            event.preventDefault();
            const ip = ipInput.value;
            const mask = maskInput.value;
            if (!isValidIp(ip)) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML += `
                    <p style="color: red;">Please enter a valid IP address.</p>
                `;
                return;
            }
            let result = calculateSubnet(ip, mask);
            resultDiv.innerHTML = '';
            let count = 0;
            while (result.subnet !== "0.0.0.0" && count < 15) 
            {
                setResults(result, false);
                result = moreSubnets(result.subnet, result.cidr, false);
                count++;
            }

            if (result.subnet !== "0.0.0.0") 
            {
                setResults(result);
                result = moreSubnets(result.subnet, result.cidr);
            }

            if (result.subnet === "0.0.0.0") 
            {
                setResults(result);
            }
        }
    );
});
