require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  	solidity: "0.8.24",
  	networks: {
	  	hardhat: {

		},
	  	ten: {
	  		url: "https://testnet.ten.xyz/v1/?token=bdea4d24e345d25412ae302d3bdc3b3018dda34f", 
	        chainId: 443, 
	        accounts: ["0x244ac182355e773cef95391540ae9f73970798d17dc8330a3a03237e3e37ca7c"],
	  	},
		sepolia: {
			chainId: 11155111,
			url: 'https://sepolia.infura.io/v3/a27749044b104f099370a5b6c5ea2914',
			accounts: ["0x244ac182355e773cef95391540ae9f73970798d17dc8330a3a03237e3e37ca7c"],
		}
	},
	etherscan: {
		apiKey: "KBJB6EM7K4YK1HZ9MXTUB3T6XADADC8FGX"	// Sepolia API key
	}
};