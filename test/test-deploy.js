const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Sport Event Contract", () => {
    const baseTokenURI = "https://www.google.com/";
    const name = "SportEventName";
    const symbol = "CryptoSports";
    const ticketTypes = [0, 1, 2, 3];

    let sportEventFactory, sportEvent, owner, account1, account2;

    beforeEach(async () => {
        sportEventFactory = await ethers.getContractFactory("SportEvent");

        sportEvent = await sportEventFactory.deploy(
            baseTokenURI,
            name,
            symbol,
            ticketTypes
        );

        [owner, account1, account2, _] = await ethers.getSigners();
    });

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            expect(await sportEvent.signer.address).to.equal(owner.address);
        });

        it("Should set the right name and symbol", async () => {
            expect(await sportEvent.name()).to.equal(name);
            expect(await sportEvent.symbol()).to.equal(symbol);
        });
    });
});
