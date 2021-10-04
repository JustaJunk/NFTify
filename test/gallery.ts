var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;


describe("Gallery", function () {

  let owner, addr1, addr2;
  let tokenAdmin, galleryGenerator;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    galleryGenerator = await ethers.getContract('NFTGalleryGenerator', owner);

  });

    it( "NFTGallery - not enough slotting fee", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await expect(
        tokenAdmin.genNFTContract(baseSettings, {value:1e11*99})
      ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");
  
    });

    it( "NFTGallery - enough slotting fee", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
  
    });

    it( "NFTGallery - initialize only once", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );
      await expect(
        gallery.initialize("https://", 1e11 )
      ).to.be.revertedWith("")
  
    });

    it( "NFTGallery - mint 3 NFT not enough ether value", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );
      await expect(
        gallery.initialize("https://", 1e11 )
      ).to.be.revertedWith("")

      await expect(
        gallery.mintToken([1, 3, 5], {value: 1000})
      ).to.be.revertedWith("Ether value sent is not correct");
  
    });

    it( "NFTGallery - mint 3 NFT success", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );

      await gallery.mintToken([1, 3, 5], {value: 3*1e11});
  
    });

    it( "NFTGallery - mint 3 NFT the id is out of bound", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );

      await expect(
        gallery.mintToken([1, 3, 101], {value: 3*1e11})
      ).to.be.revertedWith("The id is out of bound");
  
    });

    it( "NFTGallery - mint 3 NFT This token has already been minted", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );

      await gallery.mintToken([1, 3, 5], {value: 3*1e11});
      await expect(
        gallery.mintToken([1, 3, 5], {value: 3*1e11})
      ).to.be.revertedWith("This token has already been minted");
  
    });

    it( "NFTGallery - mint 3 NFT tokenURI URI query for nonexistent token", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );
      
      await expect(
        gallery.tokenURI(3)
      ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

  
    });

    it( "NFTGallery - mint 3 NFT tokenURI success", async function(){
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTGallery = await ethers.getContractFactory("NFTGallery");
      const gallery = NFTGallery.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await gallery.initialize("https://", 1e11 );

      await gallery.mintToken([1, 3, 5], {value: 3*1e11});
      
      let uri = await gallery.tokenURI(3);
      assert( uri === "https://3");

  
    });

});
