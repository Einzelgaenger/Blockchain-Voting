let web3;
let contract;
const contractAddress = "0x2a02B97cC1a9C9719225f9613480677ED864a7ce"; // Replace with your deployed contract address
const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "CandidateAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "VoteCast",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "candidatesCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_candidateId",
				"type": "uint256"
			}
		],
		"name": "getCandidate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_candidateId",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('status').innerText = "Wallet connected";

            initContract(); // Initialize the contract here after connecting

            // Fetch admin from the contract
            const admin = await contract.methods.admin().call();
            console.log('Admin address:', admin);

            // Check if the connected account is the admin
            if (accounts[0].toLowerCase() === admin.toLowerCase()) {
                document.getElementById('adminPanel').style.display = 'block'; // Show admin panel
            }
        } catch (error) {
            console.error(error);
            document.getElementById('status').innerText = "Connection failed";
        }
    } else {
        alert("Please install MetaMask!");
    }
}

function initContract() {
    contract = new web3.eth.Contract(abi, contractAddress);
    console.log('Contract initialized:', contract);
}

// Voting logic remains the same
document.getElementById('votingForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const candidateId = document.getElementById('candidateId').value;
    const accounts = await web3.eth.getAccounts();
    contract.methods.vote(candidateId).send({ from: accounts[0] })
        .then(result => {
            alert('Vote cast successfully');
        })
        .catch(error => {
            alert('Failed to cast vote');
            console.error(error);
        });
});

// Add candidate form logic (admin only)
document.getElementById('addCandidateForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const candidateName = document.getElementById('candidateName').value;
    const accounts = await web3.eth.getAccounts();
    contract.methods.addCandidate(candidateName).send({ from: accounts[0] })
        .then(result => {
            alert(`Candidate "${candidateName}" added successfully`);
        })
        .catch(error => {
            alert('Failed to add candidate');
            console.error(error);
        });
});

// Event listener for connecting wallet
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// View candidates button
document.getElementById('viewCandidates').addEventListener('click', async function() {
    const candidatesCount = await contract.methods.candidatesCount().call();
    let resultHTML = '<h3>Candidates:</h3><ul>';
    
    for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await contract.methods.getCandidate(i).call();
        resultHTML += `<li>ID: ${candidate[0]}, Name: ${candidate[1]}, Votes: ${candidate[2]}</li>`;
    }
    
    resultHTML += '</ul>';
    document.getElementById('results').innerHTML = resultHTML;
});

// View admin address button
document.getElementById('viewAdmin').addEventListener('click', async function() {
    const admin = await contract.methods.admin().call();
    document.getElementById('results').innerHTML = `<h3>Admin Address:</h3><p>${admin}</p>`;
});

// Check if an address has voted
document.getElementById('checkVotingStatus').addEventListener('click', async function() {
    const accounts = await web3.eth.getAccounts();
    const hasVoted = await contract.methods.hasVoted(accounts[0]).call();
    document.getElementById('results').innerHTML = `<h3>Voting Status:</h3><p>${hasVoted ? "You have already voted." : "You have not voted yet."}</p>`;
});
