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
	describe("Deployment", function() {
		it("Should deploy with correct args.", async () => {
			// await Auction.connect(deployer).deploy(nft.address, 100, 1);
			expect(await auction.nft()).to.eq(nft.address);
			expect(await auction.highestBid()).to.eq(100);
			expect(await auction.nftId()).to.eq(1);
			expect(await auction.seller()).to.eq(deployer.address);
    	})

		it("Should revert with message 'No such NFT!'.", async () => {
			await expect(Auction.connect(deployer).deploy(ethers.constants.AddressZero, 100, 1))
			.to.be.revertedWith("No such NFT!");
		})
	})

	describe("Function start()", function() {
		it("Should start correctly.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			const currentTime = await auction.getCurrentTime();
			expect(await nft.ownerOf(1)).to.eq(auction.address);
			expect(await auction.started()).to.eq(true);
			expect(await auction.endAt()).to.eq(currentTime.add(600));
		})

		it("Should revert with message 'Already started!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await expect(auction.connect(deployer).start()).to.be.revertedWith("Already started!");
		})

		it("Should revert with message 'Not the seller!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await expect(auction.connect(user1).start()).to.be.revertedWith("Not the seller!");
		})
	})

	describe("Function bid()", function() {
		it("Should bid correctly.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 1000});
			expect(await auction.bids(user1.address)).to.eq(1000);
			expect(await auction.highestBid()).to.eq(1000);
			expect(await auction.highestBidder()).to.eq(user1.address);
		})

		it("Should revert with message 'Auction not started yet!'.", async () => {
			await expect(auction.connect(user1).bid({value: 1000})).to.be.revertedWith("Auction not started yet!");
		})

		it("Should revert with message 'Auction already ended!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await timeAndMine.mine(600);
			await expect(auction.connect(user1).bid({value: 1000})).to.be.revertedWith("Auction already ended!");
		})

		it("Should revert with message 'Bid not high enough!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await expect(auction.connect(user1).bid({value: 10})).to.be.revertedWith("Bid not high enough!");
		})
	})

	describe("Function end()", function() {
		it("Should end correctly.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 200});
			await timeAndMine.mine(600);
			await expect(await auction.connect(user1).end())
			.to.changeEtherBalance(deployer.address, 200);
			expect(await auction.bids(auction.highestBidder())).to.eq(0);
			expect(await nft.ownerOf(1)).to.eq(user1.address);
		})

		it("Should revert with message 'Auction not started yet!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await expect(auction.connect(user1).end()).to.be.revertedWith("Auction not started yet!");
		})

		it("Should revert with message 'Auction not ended yet!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 200});
			await expect(auction.connect(user1).end()).to.be.revertedWith("Auction not ended yet!");
		})

		it("Should revert with message 'Auction already ended!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 200});
			await timeAndMine.mine(600);
			await auction.connect(user1).end();
			await expect(auction.connect(user1).end()).to.be.revertedWith("Auction already ended!");
		})

		// it("Should transfer the nft back to the seller if the bid came from address zero.", async () => {
		// 	await nft.connect(deployer).approve(auction.address, 1);
		// 	await auction.connect(deployer).start();
		// 	await auction.connect(ethers.constants.AddressZero).bid({value: 200});
		// 	await timeAndMine.mine(600);
		// 	await auction.connect(user1).end();
		// 	expect(await nft.ownerOf(1)).to.eq(deployer.address);
		// })
	})

	describe("Function withdraw()", function() {
		it("Should withdraw correctly.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 200});
			await auction.connect(user2).bid({value: 300});
			await timeAndMine.mine(600);
			await auction.connect(user1).end();
			await expect(await auction.connect(user1).withdraw())
			.to.changeEtherBalance(user1.address, 200);	
			expect(await auction.bids(user1.address)).to.eq(0);		
		})

		it("Should revert with message 'Auction not ended yet!'.", async () => {
			await nft.connect(deployer).approve(auction.address, 1);
			await auction.connect(deployer).start();
			await auction.connect(user1).bid({value: 200});
			await auction.connect(user2).bid({value: 300});
			await expect(auction.connect(user1).withdraw()).to.be.revertedWith("Auction not ended yet!");
		})
	})
})