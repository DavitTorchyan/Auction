// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./NFT.sol";

contract EnglishAuction {

    NFT public nft;
    uint256 public nftId;

    address payable public seller;
    uint public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public bids;

    constructor(NFT _nft, uint256 _startingPrice, uint256 _nftId) {
        require(address(_nft) != address(0), "No such NFT!");
        nft = _nft;
        highestBid = _startingPrice;
        nftId = _nftId;
        seller = payable(msg.sender);
    }

    function start() external {
        require(!started, "Already started!");
        require(msg.sender == seller, "Not the seller!");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = block.timestamp + 600;
    }

    function bid() external payable {
        require(started, "Auction not started yet!");
        require(block.timestamp < endAt, "Auction already ended!");
        require(msg.value > highestBid, "Bid not high enough!");

        bids[msg.sender] = msg.value;
        highestBid = msg.value;
        highestBidder = msg.sender; 
    }

    function withdraw() external {
        require(ended, "Auction not ended yet!");
        uint256 balance = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    function end() external {
        require(started, "Auction not started yet!");
        require(block.timestamp >= endAt, "Auction not ended yet!");
        require(!ended, "Auction already ended!");

        if(highestBidder != address(0)) {
            ended = true;
            bids[highestBidder] = 0;
            nft.safeTransferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        }else {
            ended = true;
            nft.safeTransferFrom(address(this), seller, nftId);
        }
    }

    function getCurrentTime() public view returns(uint256) {
        return block.timestamp;
    }

}
