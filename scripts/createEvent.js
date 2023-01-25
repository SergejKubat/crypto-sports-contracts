const fs = require("fs");
const { ethers } = require("hardhat");

const SportEventRegistry = require("../abi/SportEventRegistry.json");

async function main() {
    const [owner, organizer] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", SportEventRegistry.address, owner);

    // parameters for new sport event
    const baseURI = "https://www.google.com/";
    const name = "Lorem Ipsum Event";
    const symbol = "CryptoSports";
    const amounts = [50, 25];
    const prices = [ethers.utils.parseEther("0.0001"), ethers.utils.parseEther("0.0005")];

    // get future timestamp
    const futureDate = new Date();

    futureDate.setHours(new Date().getHours() + 20);

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
