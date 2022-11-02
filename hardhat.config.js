require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@atixlabs/hardhat-time-n-mine");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  
  namedAccounts: {
		deployer: {
			default: 0
		},
		user1: {
			default: 1
		},
		user2: {
			default: 2
		},
		user3: {
			default: 3
		},
		user4: {
			default: 4
		},
		user5: {
			default: 5
		}
	},
};
