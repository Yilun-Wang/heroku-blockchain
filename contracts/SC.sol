pragma solidity ^ 0.4.18;


contract SC{
    /*It holds a list of references to Patient-
Provider Relationship contracts (PPRs)*/    
    string public RegistrarID;
    address public RegistrarEthAddr;
    
        
    mapping (string=>address) PPRAddress; //From providerID to PPR address.
    mapping (address => int) PPRStatus; //From PPR address to PPRStatus
                                        //PPRStatus == 0 means it does not exists.
                                        //PPRStatus == 1 means it exists.
    
    /*Patients
can accept, reject or delete relationships*/

    constructor(string _RegistrarID,address _RegistrarEthAddr)public{
        RegistrarID=_RegistrarID;
        RegistrarEthAddr=_RegistrarEthAddr;
    }
    
    function getPPRAddress(string _ProviderID) view public returns(address){
        return PPRAddress[_ProviderID];
    }
    function getStatus(address _PPR)view public returns(int){
        return PPRStatus[_PPR];
    }
    
    //Update the status of a existing PPR.
    function updateStatus(address _PPR,int _Status)public returns(int){
        
        if(PPRStatus[_PPR]==0)//The PPR is not in our list.
            return -1;
        else
            PPRStatus[_PPR]=_Status;
        return 0;
    }
    
    function addPPR(string _ProviderID,address _PPR)public returns(int){
        
        if(PPRStatus[_PPR]==0)
            return -1;//The PPR already exists.
        
        //If not, add the new PPR into mapping.
        PPRAddress[_ProviderID]=_PPR;
        //Initialize the status.
        PPRStatus[_PPR]=1;
                            
        return 0;
    }
    function deletePPR(address _PPR)public returns(int){
        if(PPRStatus[_PPR]==0)//_PPR is not in the list.
            return -1;
        else
            PPRStatus[_PPR]=0;//Mark the Status as deleted.
        
        return 0;    
    }
}

