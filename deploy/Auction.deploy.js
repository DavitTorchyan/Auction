module.exports = async ({
	deployments: { deploy },
	ethers: {
		getNamedSigners,
		getContract,
		utils: { parseEther }
	}

}) => {
	const { deployer } = await getNamedSigners();
	const nft = await getContract("NFT");
	await deploy("EnglishAuction", {
		from: deployer.address,
		contract: "EnglishAuction",
		args: [nft.address, 100, 1],
		log: true
	});
	const auction = await getContract("EnglishAuction");
};
module.exports.tags = ["EnglishAuction", "hardhat"];
module.exports.dependencies = ["NFT"];
