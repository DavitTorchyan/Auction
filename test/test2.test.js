const { expect } = require("chai");
const {
	ethers: {
		getContract,
		getContractFactory,
		getContractAt,
		getNamedSigners,
		provider: { getBlockNumber },
		utils: { parseEther },
	},
	deployments: { fixture, createFixture },
	timeAndMine,
    ethers
} = require("hardhat");
const {
	time: { advanceBlockTo }
} = require("@openzeppelin/test-helpers");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber } = require("ethers");
const setupFixture = createFixture(async () => {
	await fixture("hardhat");
	const { deployer, user1, user2, user3, user4, user5 } = await getNamedSigners();
	const auction = await getContract("EnglishAuction");
	const Auction = await hre.ethers.getContractFactory("EnglishAuction");
	const nft = await getContract("NFT");
	await nft.connect(deployer).safeMint(deployer.address, 1);


	return [nft, auction, Auction];
});

describe("Auction", function () {
	let deployer,
		user1,
		user2,
		user3,
		user4,
		user5,
		nft,
		auction,
		Auction;

	before("Before All: ", async function () {
		({ deployer, user1, user2, user3, user4, user5 } = await getNamedSigners());
	});

    beforeEach(async function () {
		[nft, auction, Auction, signers] =
			await setupFixture();
	});

    describe("Deployment", function () {
        it("Should deploy correctly", async => {
            expect(await auction.nft()).to.eq(nft.address);
            
        })
    })





})