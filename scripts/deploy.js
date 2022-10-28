const { ethers } = require("hardhat");

async function main() {
    const baseTokenURI = "https://www.google.com";

    const SportEventFactory = await ethers.getContractFactory("SportEvent");

    console.log("Deploying contract...");

    const sportEvent = await SportEventFactory.deploy(baseTokenURI);

    await sportEvent.deployed();

    console.log(`Deployed contract to: ${sportEvent.address}`);

    const [owner, otherAccount] = await ethers.getSigners();

    const firstTokenId = await sportEvent.mint(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );

    console.log("ID of first token is: ", firstTokenId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
