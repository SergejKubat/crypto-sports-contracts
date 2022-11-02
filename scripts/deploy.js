const { ethers } = require("hardhat");

async function main() {
    const baseTokenURI = "https://www.google.com/";
    const name = "SportEventName";
    const symbol = "CryptoSports";
    const ticketTypes = [0, 1, 2, 3];

    const [owner] = await ethers.getSigners();
    const ownerBalance = await owner.getBalance();

    console.log(`Owner account address: ${owner.address}`);
    console.log(`Owner balance: ${ownerBalance.toString()} ETH`);

    const SportEventFactory = await ethers.getContractFactory("SportEvent");

    console.log("Deploying contract...");

    const sportEvent = await SportEventFactory.deploy(
        baseTokenURI,
        name,
        symbol,
        ticketTypes
    );

    await sportEvent.deployed();

    console.log(`Deployed contract to: ${sportEvent.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
