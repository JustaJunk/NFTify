const {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
const { BigNumber } = require("ethers");
const { expect, assert } = require("chai");
const utils = require('ethers').utils;

describe("admin", function () {

  let owner, addr1, addr2;
  let tokenAdmin, blindboxGenerator;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

  });

  it( "admin check", async function () {

    // console.log("tokenAdmin: ", tokenAdmin.address);
    let contractList = await tokenAdmin.getContractList();
    // console.log("contractList", contractList);
    await expect(
      contractList.length
    ).to.equal( 0 );
    
    // slotting fee
    let slottingFee0 = await tokenAdmin.slottingFee(0);
    assert( await slottingFee0.toNumber() == 5e11 , "slottingFee 0 not right");
    let slottingFee1 = await tokenAdmin.slottingFee(1);
    assert( await slottingFee1.toNumber() == 1e12 , "slottingFee 1 not right");

    // await expect(
    //   tokenAdmin.slottingFee(2)
    // ).to.be.revertedWith("NoobFriendlyTokenAdmin: generator not exists");

    // typeToGenerator
    const typeToGenerator = await tokenAdmin.typeToGenerator;
    console.log(await typeToGenerator.length);

  });

  it( "NFTBlindboxGenerator", async function(){

    assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
    let slottingFee = await blindboxGenerator.slottingFee();
    assert( slottingFee.toNumber() === 1e12, "blindbox slotting fee not right");
    
    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 1
    }

    await expect(
      blindboxGenerator.genNFTContract( addr1.address, baseSettings )
    ).to.be.revertedWith("");

    await expect(
      blindboxGenerator.connect(addr1).changeSlottingFee(1)
    ).to.be.revertedWith("");

    await blindboxGenerator.changeSlottingFee(1);
    slottingFee = await blindboxGenerator.slottingFee();
    assert( slottingFee.toNumber() === 1, "blindbox slotting fee equal to 1");
  });


  it( "NoobFriendlyTokenTemplate", async function(){

    assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12 * 100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);

    let typeOfNFT = await blindbox.typeOfNFT();
    let maxSupply = await blindbox.maxSupply();
    let saleIsActive = await blindbox.saleIsActive();
    let isInit = await blindbox.isInit();
    let maxPurchase = await blindbox.maxPurchase();

    assert( typeOfNFT === 1, "typeOfNFT is 1");
    assert( maxSupply === 100, "maxSupply is 100");
    assert( saleIsActive === false, "saleIsActive is false");
    assert( isInit === false, "isInit is false");
    assert( maxPurchase.toNumber() === 0, "maxPurchase not initialize is 0");

    await blindbox.flipSaleState();
    saleIsActive = await blindbox.saleIsActive();
    assert( saleIsActive === true, "flipped saleIsActive is true");

  });

  it( "NFTBlindbox", async function(){

    assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);

    let maxSupply = await blindbox.maxSupply();
    let nowBlock = await ethers.provider.getBlockNumber();

    await blindbox.initialize("https://", 12, 1, nowBlock );
    await expect(
      blindbox.initialize("https://", 12, 1, nowBlock )
    ).to.be.revertedWith("")

    await blindbox.reserveNFT();
    let ownerBalance = await blindbox.balanceOf(owner.address);
    assert( ownerBalance.toNumber() <= maxSupply );

    await expect(
      blindbox.setRevealTimestamp( nowBlock - 1 )
    ).to.be.revertedWith("revealTimeStamp_ < block.timestamp");

    await expect(
      blindbox.connect(addr1).mintToken( 10,  {value:1*10})
    ).to.be.revertedWith("sale is not active");

    await blindbox.flipSaleState();
    await blindbox.connect(addr1).mintToken( 10,  {value:1*10});
    let addr1Balance = await blindbox.balanceOf(addr1.address);
    assert( addr1Balance.toNumber() === 10, "add1 balance should be 10" );

    
    //tokenURI
    let URI0 = await blindbox.tokenURI(0);
    assert( URI0 ===  "https://0", "original URI equal to https://0");
    
    await blindbox.setStartingIndex();
    URI0 = await blindbox.tokenURI(0);
    console.log(URI0);
    assert( URI0 !=  "https://0", "after lottery draw URI not  equal to https://0");

  });


    // console.log( bl

    // const { expect } = require("chai");
    // const { ethers } = require('hardhat');

    // const sevenDays = 7 * 24 * 60 * 60;

    // const blockNumBefore = await ethers.provider.getBlockNumber();
    // const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    // const timestampBefore = blockBefore.timestamp;

    // await ethers.provider.send('evm_increaseTime', [sevenDays]);
    // await ethers.provider.send('evm_mine');

    // const blockNumAfter = await ethers.provider.getBlockNumber();
    // const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    // const timestampAfter = blockAfter.timestamp;

    // expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
    // expect(timestampAfter).to.be.equal(timestampBefore + sevenDays);

});
