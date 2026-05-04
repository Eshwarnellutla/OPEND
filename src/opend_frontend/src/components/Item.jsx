import React, { useEffect, useState } from "react";

import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenidlFactory} from "../../../declarations/token_backend";
import { Principal } from "@dfinity/principal";
import { agent } from "../agent";
import Button from "./Button"
import { opend_backend } from "../../../declarations/opend_backend";
import {CURRENT_USER_ID}from "../constants/user"
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const[button,setButton]=useState();
 const[priceInput,setPriceinput]=useState();
 const[loadHidden,setloadHidden]=useState(true);
 const [style,setStyle]=useState();
 const[sellStatus,setsellStatus]=useState("");
const[PriceLable,setPriceLable]=useState();
const [shouldDisplay,setDisplay]=useState(true)


  const id = props.id;

let  NFTActor;
  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getImage();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    setOwner(owner.toText());
    setImage(image);
    if(props.role=="collection"){
const nftIsListed= await opend_backend.isListed(props.id);
if(nftIsListed){
  setOwner("OpenD");
  setStyle({filter:"blur(4px)"});
  setsellStatus("Listed")
}else{
   setButton(<Button handleClick={handleSell} text={"Sell"}/>)
}
    }else if(props.role==="discover"){
      const originalOwner=await opend_backend.getOriginalOwner(props.id);
      if(originalOwner.toText() != CURRENT_USER_ID.toText()){
         setButton(<Button handleClick={handlBuy} text={"Buy"}/>)
      }
    const price = await opend_backend.getListiedNFTPrice(props.id);
 setPriceLable(<PriceLabel sellprice={price.toString()} />)
    };
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price
     function handleSell(){
     console.log("eshwar")
     
     setPriceinput(<input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e)=>(price=e.target.value)}
      />)
        
      setButton(<Button handleClick={sellItem} text={"Confirm"} />)
  };
   async function sellItem(){
    setStyle({filter:"blur(4px)"});
    setloadHidden(false)
  console.log("set price=" +price);
  const listingResult= await opend_backend.listItem(props.id, BigInt(price))

  console.log("seidkbe"+ listingResult);

if (listingResult.trim() === "Success") {
  const opendId = await opend_backend.getOpenDCanisterID();
  console.log("OpenD Canister ID:", opendId.toText());

  const tranferResult = await NFTActor.tranferOwnership(opendId);
  console.log("transfer:", tranferResult);
  if(tranferResult=="Success"){
    setloadHidden(true);
    setButton();
    setPriceinput();
    setOwner("OpenD");
    setsellStatus("Listed")
    
  }
}
  };
  async function handlBuy(params) {
    console.log("buyind")
    setloadHidden(false)
    const tokenActor= await Actor.createActor(tokenidlFactory, {
      agent,
      canisterId: Principal.fromText("v27v7-7x777-77774-qaaha-cai") ,
    });
 const sellerId=await opend_backend.getOriginalOwner(props.id);
 const itemPrice= await opend_backend.getListiedNFTPrice(props.id)
    const result = await tokenActor.transfer(sellerId,itemPrice);
if (result=="Success"){
  const transferResult=await opend_backend.completePurchase(props.id,sellerId,CURRENT_USER_ID);
  console.log("purchase"+transferResult);
  setloadHidden(true)
  setDisplay(false);
}
  }

  return (
    <div  style={{display: shouldDisplay ? "inline":"none"}}className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={style}
        />
<div className="lds-ellipsis" hidden={loadHidden}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {PriceLable}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text">{sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
