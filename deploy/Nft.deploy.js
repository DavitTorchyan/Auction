module.exports = async ({
	deployments: { deploy },
	ethers: {
		getNamedSigners,
		getContract,
		utils: { parseEther }
	}
}) => {
	const { deployer } = await getNamedSigners();
	await deploy("NFT", {
		from: deployer.address,
		contract: "NFT",
		args: [],
		log: true
	});
};
module.exports.tags = ["NFT", "hardhat"];
