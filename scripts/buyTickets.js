const { ethers } = require("hardhat");

const SportEventRegistry = require("../abi/SportEventRegistry.json");

const lastCreatedEvent = require("../data/lastCreatedEvent.json");

async function main() {
    const [owner, organizer, admin, user] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", SportEventRegistry.address, user);

    const sportEventAddress = lastCreatedEvent.sportEventAddress;
    const TICKET_TYPES = [0, 0, 1];
    const TOTAL_PRICE_ETH = "0.2";

    const transactionResponse = await sportEventRegistry.buyTickets(sportEventAddress, TICKET_TYPES, {
        value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
    });

    const transactionReceipt = await transactionResponse.wait();

    const eventArgs = transactionReceipt.events[transactionReceipt.events.length - 1].args;

    console.log(eventArgs);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
