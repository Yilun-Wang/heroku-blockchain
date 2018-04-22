pragma solidity ^ 0.4.18;


contract SC{
    /*It holds a list of references to Patient-
Provider Relationship contracts (PPRs)*/    
    string public RegistrarID;
    address public RegistrarEthAddr;
    
    address[] public PPRAddrs;
    
    mapping (address => int) Status;
    
    /*Patients
can accept, reject or delete relationships*/

    function SC(string _RegistrarID,address _RegistrarEthAddr)public{
        RegistrarID=_RegistrarID;
        RegistrarEthAddr=_RegistrarEthAddr;
    }
    
    function getStatus(address _PPR)view public returns(int){
        return Status[_PPR];
    }
    
    //Update the status of a existing PPR.
    function updateStatus(address _PPR,int _Status)public returns(int){
        
        if(Status[_PPR]==0)//The PPR is not in our list.
            return -1;
        else
            Status[_PPR]=_Status;
        return 0;
    }
    
    function addPPR(address _PPR)public returns(int){
        for(uint i=0;i<PPRAddrs.length;i++){
            if(PPRAddrs[i]==_PPR)
                {
                    if(Status[_PPR]==0)
                        {
                            //Reuse the deleded slot.
                            Status[_PPR]=1;
                            return 0;
                        }
                    else{
                        //The PPR already exists.
                        return -1;
                    }
                }
        }    
        
        //The PPR is total new to the list.
        PPRAddrs.push(_PPR);
        //Initialize the status.
        Status[_PPR]=1;
                            
        return 0;
    }
    function deletePPR(address _PPR)public returns(int){
        if(Status[_PPR]==0)//_PPR is not in the list.
            return -1;
        else
            Status[_PPR]=0;//Mark the Status as deleted.
        
        return 0;    
    }
}

