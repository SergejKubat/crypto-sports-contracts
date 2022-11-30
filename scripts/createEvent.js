const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
    const [owner, organizer] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", owner);

    // parameters for new sport event
    const baseURI = "https://www.google.com/";
    const name = "Test Event 123";
    const symbol = "CryptoSports";
    const amounts = [100, 50, 25, 5];
    const prices = [
        ethers.utils.parseEther("0.05"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.25"),
        ethers.utils.parseEther("0.5")
    ];

    // get future timestamp
    const futureDate = new Date();

    futureDate.setHours(new Date().getHours() + 2);

    const endTimestamp = Math.floor(futureDate.getTime() / 1000);

    const transactionResponse = await sportEventRegistry.createSportEvent(
        baseURI,
        name,
        symbol,
        amounts,
        prices,
        organizer.address,
        endTimestamp
    );

    const transactionReceipt = await transactionResponse.wait();

    const eventArgs = transactionReceipt.events[transactionReceipt.events.length - 1].args;

    const createdEventData = {
        sportEventAddress: eventArgs.sportEventAddress,
        creator: eventArgs.creator,
        baseURI: eventArgs.baseURI,
        name: eventArgs.name
    };

    fs.writeFileSync("data/lastCreatedEvent.json", JSON.stringify(createdEventData));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
