import { HttpAgent } from "@dfinity/agent";

export const agent = new HttpAgent({
  host: "http://127.0.0.1:4943",
  
});

// only once
 
  agent.fetchRootKey();
