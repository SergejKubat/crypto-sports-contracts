const { Contract } = require("ethers");
const { ethers } = require("hardhat");

const SportEventRegistry = require("../abi/SportEventRegistry.json");

async function main() {
    const accounts = await ethers.getSigners();

    const superAdmin = accounts[0];

    const sportEventRegistry = new Contract(SportEventRegistry.address, SportEventRegistry.abi);

    const sportEventRegistryWithSigner = sportEventRegistry.connect(superAdmin);

    // parameters for new sport event
    const baseURI = "https://www.google.com/";
    const name = "Test Event 123";
    const symbol = "CryptoSports";
    const amounts = [100, 50, 25, 5];
    const prices = [
        ethers.utils.parseEther("0.05"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.25"),
        ethers.utils.parseEther("0.5"),
    ];

    // get future timestamp
    const futureDate = new Date();

    futureDate.setHours(new Date().getHours() + 2);

    const endTimestamp = Math.floor(futureDate.getTime() / 1000);

    const transactionResponse = await sportEventRegistryWithSigner.createSportEvent(
        baseURI,
        name,
        symbol,
        amounts,
        prices,
        accounts[3].address,
        endTimestamp
    );

    const transactionReceipt = await transactionResponse.wait();

    console.log(transactionReceipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
