import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import NFTActorclass "../NFT/nft";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";


 
  persistent actor OpenD {

    private type Listing={
     itemOwner : Principal;
  itemPrice : Nat;
    };

  transient var mapOfNFTs=HashMap.HashMap<Principal, NFTActorclass.NFT>(1, Principal.equal, Principal.hash);

  transient var  mapOfOwner= HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

  transient var  mapofListings= HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);
  
  
  public shared(msg) func mint(imageData:[Nat8],name:Text):async Principal{

    if (Cycles.balance() <  2_000_000_000_000) {
     Debug.print("Not enough cycles to mint NFT");
  throw Error.reject("Not enough cycles to mint NFT");
  };

  Cycles.add(2_000_000_000_000);
  let owner: Principal =msg.caller;




 let newNFT=await NFTActorclass.NFT(name, owner, imageData);
 
 

 let newNftPrincipal= await newNFT.getCansiterId();

   mapOfNFTs.put(newNftPrincipal,newNFT);

   addToOwnershipMap(owner,newNftPrincipal);

return newNftPrincipal;
  };
  public func addToOwnershipMap(owner:Principal,nftId:Principal){

    var ownedNFTs: List.List<Principal> = switch(mapOfOwner.get(owner)){
      case null List.nil<Principal>();
      case (?result) result;
    };

    ownedNFTs:= List.push(nftId,ownedNFTs);
    mapOfOwner.put(owner,ownedNFTs)
  };
  public query func getOwendNFTs(user:Principal):async [Principal]{
     
     var userNFTs: List.List<Principal> = switch(mapOfOwner.get(user)){
      case null List.nil<Principal>();
      case (?result) result;
    };

    return List.toArray(userNFTs);
  };

public query func getListedNFTs():async [Principal]{
   var Ids= Iter.toArray(mapofListings.keys());
   return Ids
};




  public shared(msg) func listItem(id:Principal,price:Nat):async Text{
  var item:NFTActorclass.NFT= switch(mapOfNFTs.get(id)){
  case null return "NFT is does not Exit";
  case(?result) result;
};
 let owner=await item.getOwner();

  if(Principal.equal(owner,msg.caller)){
  let newListing : Listing = {
  itemOwner=owner;
  itemPrice = price;
};
  mapofListings.put(id,newListing);
   return "Success";

}else{
  return "you dont own Nft"
};

  };
  public query func getOpenDCanisterID():async Principal{
   Debug.print("🔥 getOpenDCanisterID() called");
  return Principal.fromActor(OpenD);
 
};
public query func isListed(id : Principal) : async Bool {
  if(mapofListings.get(id)==null){
    return false;
  }else{
    return true;
  }
};
public query func getOriginalOwner(id:Principal):async Principal{
  var listing :Listing=switch(mapofListings.get(id)){
      case null return Principal.fromText("");
  case(?result) result;
  };
  return listing.itemOwner;
};
public query func getListiedNFTPrice(id:Principal):async Nat{
  var listing :Listing=switch(mapofListings.get(id)){
      case null return 0 ;
  case(?result) result;
  };
  return listing.itemPrice;
};
public shared(msg)func completePurchase(id:Principal,owerid:Principal,newOwnerId:Principal):async Text{
var purchaseNFT:NFTActorclass.NFT=switch(mapOfNFTs.get(id)){
  case null return "NFT does not exist";
  case (?result) result;
};
let transferResult = await purchaseNFT.tranferOwnership(newOwnerId);
if (transferResult == "Success"){
  mapofListings.delete(id);
  var ownerNfts:List.List<Principal> =switch(mapOfOwner.get(owerid)){
    case null  List.nil<Principal>();
    case (?result) result;
  };
  ownerNfts := List.filter(ownerNfts,func (listItemId:Principal):Bool{
  return listItemId !=id;
});
addToOwnershipMap(newOwnerId,id);
return "Success"
}else{
return  transferResult;
};
}
};
