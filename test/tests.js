const { ethers } = require("hardhat");
const { expect } = require("chai");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Setup contracts", () => {
    let SportEventFactory, sportEventFactory, SportEventRegistry, sportEventRegistry, superAdmin, admin, organizer, user1;

    beforeEach(async () => {
        // deploying factory
        SportEventFactory = await ethers.getContractFactory("SportEventFactory");

        sportEventFactory = await SportEventFactory.deploy();

        await sportEventFactory.deployed();

        // deploying registry
        SportEventRegistry = await ethers.getContractFactory("SportEventRegistry");

        sportEventRegistry = await SportEventRegistry.deploy(sportEventFactory.address);

        await sportEventRegistry.deployed();

        // grant role for registry
        const SPORT_EVENT_CREATOR_ROLE = await sportEventFactory.SPORT_EVENT_CREATOR_ROLE();

        await sportEventFactory.grantRole(SPORT_EVENT_CREATOR_ROLE, sportEventRegistry.address);

        [superAdmin, admin, organizer, user1, _] = await ethers.getSigners();
    });

    describe("Factory contract", () => {
        describe("Deployment", () => {
            it("Should set the right owner", async () => {
                expect(await sportEventFactory.signer.address).to.equal(superAdmin.address);
            });

            it("Should grant the right roles to super admin", async () => {
                const DEFAULT_ADMIN_ROLE = sportEventFactory.DEFAULT_ADMIN_ROLE();
                const SPORT_EVENT_CREATOR_ROLE = await sportEventFactory.SPORT_EVENT_CREATOR_ROLE();

                expect(await sportEventFactory.hasRole(DEFAULT_ADMIN_ROLE, superAdmin.address)).to.equal(true);
                expect(await sportEventFactory.hasRole(SPORT_EVENT_CREATOR_ROLE, superAdmin.address)).to.equal(true);
            });

            it("Should grant the right role to registry contract", async () => {
                const SPORT_EVENT_CREATOR_ROLE = await sportEventFactory.SPORT_EVENT_CREATOR_ROLE();

                expect(await sportEventFactory.hasRole(SPORT_EVENT_CREATOR_ROLE, sportEventRegistry.address)).to.equal(true);
            });
        });
    });

    describe("Registry contract", () => {
        describe("Deployment", () => {
            it("Should set the right owner", async () => {
                expect(await sportEventRegistry.signer.address).to.equal(superAdmin.address);
            });

            it("Should set the right factory", async () => {
                const factoryAddress = await sportEventRegistry.factory();

                expect(factoryAddress).to.equal(sportEventFactory.address);
            });

            it("Should grant the right roles to super admin", async () => {
                const DEFAULT_ADMIN_ROLE = sportEventRegistry.DEFAULT_ADMIN_ROLE();
                const SPORT_EVENT_CREATOR_ROLE = await sportEventRegistry.SPORT_EVENT_CREATOR_ROLE();

                expect(await sportEventRegistry.hasRole(DEFAULT_ADMIN_ROLE, superAdmin.address)).to.equal(true);
                expect(await sportEventRegistry.hasRole(SPORT_EVENT_CREATOR_ROLE, superAdmin.address)).to.equal(true);
            });

            it("Should grant the right role to provided account", async () => {
                const SPORT_EVENT_CREATOR_ROLE = await sportEventRegistry.SPORT_EVENT_CREATOR_ROLE();

                await sportEventRegistry.grantRole(SPORT_EVENT_CREATOR_ROLE, admin.address);

                expect(await sportEventRegistry.hasRole(SPORT_EVENT_CREATOR_ROLE, admin.address)).to.equal(true);
            });
        });

        describe("Transactions", () => {
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

            let deployedEventAddress;

            beforeEach(async () => {
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

                deployedEventAddress = eventArgs.sportEventAddress;
            });

            describe("Create new Sport Event", () => {
                it("Should emit SportEventCreated event with right parameters", async () => {
                    await expect(
                        sportEventRegistry.createSportEvent(baseURI, name, symbol, amounts, prices, organizer.address, endTimestamp)
                    )
                        .to.emit(sportEventRegistry, "SportEventCreated")
                        .withArgs(anyValue, superAdmin.address, baseURI, name, endTimestamp);
                });

                it("Should revert if account hasn't appropriate role", async () => {
                    await expect(
                        sportEventRegistry
                            .connect(user1)
                            .createSportEvent(baseURI, name, symbol, amounts, prices, organizer.address, endTimestamp)
                    ).to.be.revertedWith("Caller is not authorized.");
                });

                it("Should revert if amounts and prices aren't the same size", async () => {
                    await expect(
                        sportEventRegistry.createSportEvent(baseURI, name, symbol, [100, 50, 25], prices, organizer.address, endTimestamp)
                    ).to.be.revertedWith("Prices and amounts must be same size.");
                });
            });

            describe("Pause Sport Event", () => {
                it("Should emit SportEventPaused event with right parameters", async () => {
                    await expect(sportEventRegistry.pauseEvent(deployedEventAddress))
                        .to.emit(sportEventRegistry, "SportEventPaused")
                        .withArgs(deployedEventAddress);
                });

                it("Should revert if account hasn't appropriate role", async () => {
                    await expect(sportEventRegistry.connect(user1).pauseEvent(deployedEventAddress)).to.be.revertedWith(
                        "Caller is not authorized."
                    );
                });

                it("Should revert if event doesn't exist", async () => {
                    await expect(sportEventRegistry.pauseEvent("0xb794f5ea0ba39494ce839613fffba74279579268")).to.be.revertedWith(
                        "Event doesn't exist."
                    );
                });

                it("Should revert if event is already paused", async () => {
                    await sportEventRegistry.pauseEvent(deployedEventAddress);

                    await expect(sportEventRegistry.pauseEvent(deployedEventAddress)).to.be.revertedWith("Event is already paused.");
                });
            });

            describe("Unpause Sport Event", () => {
                it("Should emit SportEventUnpaused event with right parameters", async () => {
                    await sportEventRegistry.pauseEvent(deployedEventAddress);

                    await expect(sportEventRegistry.unpauseEvent(deployedEventAddress))
                        .to.emit(sportEventRegistry, "SportEventUnpaused")
                        .withArgs(deployedEventAddress);
                });

                it("Should revert if account hasn't appropriate role", async () => {
                    await expect(sportEventRegistry.connect(user1).unpauseEvent(deployedEventAddress)).to.be.revertedWith(
                        "Caller is not authorized."
                    );
                });

                it("Should revert if event doesn't exist", async () => {
                    await expect(sportEventRegistry.unpauseEvent("0xb794f5ea0ba39494ce839613fffba74279579268")).to.be.revertedWith(
                        "Event doesn't exist."
                    );
                });

                it("Should revert if event is already active", async () => {
                    await expect(sportEventRegistry.unpauseEvent(deployedEventAddress)).to.be.revertedWith("Event is already active.");
                });
            });

            describe("Sport Event info", () => {
                it("Should set the right amounts for ticket types", async () => {
                    expect(await sportEventRegistry.getAmount(deployedEventAddress, 0)).to.equal(amounts[0]);
                    expect(await sportEventRegistry.getAmount(deployedEventAddress, 1)).to.equal(amounts[1]);
                    expect(await sportEventRegistry.getAmount(deployedEventAddress, 2)).to.equal(amounts[2]);
                    expect(await sportEventRegistry.getAmount(deployedEventAddress, 3)).to.equal(amounts[3]);
                });

                it("Should set the right prices for ticket types", async () => {
                    expect(await sportEventRegistry.getPrice(deployedEventAddress, 0)).to.equal(prices[0]);
                    expect(await sportEventRegistry.getPrice(deployedEventAddress, 1)).to.equal(prices[1]);
                    expect(await sportEventRegistry.getPrice(deployedEventAddress, 2)).to.equal(prices[2]);
                    expect(await sportEventRegistry.getPrice(deployedEventAddress, 3)).to.equal(prices[3]);
                });
            });

            describe("Purchasing tickets", () => {
                const TICKET_TYPES = [0, 0, 1];
                const TOTAL_PRICE_ETH = "0.2";

                it("Should emit TicketsSold event", async () => {
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
                        })
                    ).to.be.emit(sportEventRegistry, "TicketsSold");
                });

                it("Should decrease account balance", async () => {
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
                        })
                    ).to.changeEtherBalance(user1, ethers.utils.parseEther("-0.2"));

                    // also if the amount is exceeded
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther("0.3")
                        })
                    ).to.changeEtherBalance(user1, ethers.utils.parseEther("-0.2"));
                });

                it("Should revert if event doesn't exist", async () => {
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets("0xb794f5ea0ba39494ce839613fffba74279579268", TICKET_TYPES, {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
                        })
                    ).to.be.revertedWith("Event doesn't exist.");
                });

                it("Should revert if ticket types are 0", async () => {
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, [], {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
                        })
                    ).to.be.revertedWith("Ticket types cannot be 0.");
                });

                /*it("Should revert if event has passed", async () => {
                    // change network time
                    await time.increaseTo(endTimestamp);

                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH),
                        })
                    ).to.be.revertedWith("The event has passed.");
                });*/

                it("Should revert if insufficient funds", async () => {
                    await expect(
                        sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther("0.1")
                        })
                    ).to.be.revertedWith("Insufficient funds.");
                });

                describe("After the tickets have been purchased", () => {
                    beforeEach(async () => {
                        await sportEventRegistry.connect(user1).buyTickets(deployedEventAddress, TICKET_TYPES, {
                            value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
                        });
                    });

                    it("Should update tickets amount", async () => {
                        expect(await sportEventRegistry.getAmount(deployedEventAddress, 0)).to.equal(amounts[0] - 2);
                        expect(await sportEventRegistry.getAmount(deployedEventAddress, 1)).to.equal(amounts[1] - 1);
                    });

                    it("Should set the correct count of purchased tickets for account", async () => {
                        expect(await sportEventRegistry.getPurchases(user1.address, deployedEventAddress)).to.equal(TICKET_TYPES.length);
                    });

                    it("Should set the right balances", async () => {
                        expect(await sportEventRegistry.getBalance(deployedEventAddress)).to.equal(ethers.utils.parseEther("0.02"));
                        expect(await sportEventRegistry.connect(organizer).getBalance(deployedEventAddress)).to.equal(
                            ethers.utils.parseEther("0.18")
                        );
                    });

                    describe("Withdraw funds", () => {
                        it("Should withdraw funds", async () => {
                            await expect(sportEventRegistry.withdraw(deployedEventAddress)).to.changeEtherBalance(
                                superAdmin,
                                ethers.utils.parseEther("0.02")
                            );

                            await expect(sportEventRegistry.connect(organizer).withdraw(deployedEventAddress)).to.changeEtherBalance(
                                organizer,
                                ethers.utils.parseEther("0.18")
                            );
                        });

                        it("Should revert if account has no funds", async () => {
                            await expect(sportEventRegistry.connect(user1).withdraw(deployedEventAddress)).to.be.revertedWith(
                                "There is no funds."
                            );
                        });
                    });
                });
            });
        });
    });
});
