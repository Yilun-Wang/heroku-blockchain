pragma solidity ^ 0.4.18;

contract RC{
    //A mapping allocates the memory for a hash table. The keys of the hash table
    //and the type of values in hash table entries are declared before and after
    //the => expression.
    mapping (string => address) EthAddr;
    mapping (string => address) SCAddr;
    //These are free hash memories!
    
    function registerEthAddr(string _RegistrarID,address _EthAddr)public returns(int){
        if(EthAddr[_RegistrarID]!=0)
            {
                /*Registration is one time, ID shall not collide. */
                return -1;
            }
        else{
            EthAddr[_RegistrarID]=_EthAddr;
            return 0;
        }
    }
    
    function registerSCAddr(string _RegistrarID,address _SCAddr)public returns(int){
        if(SCAddr[_RegistrarID]!=0)
            {
                /*Registration is one time, ID shall not collide. */
                return -1;
            }
        else{
            SCAddr[_RegistrarID]=_SCAddr;
            return 0;
        }
    }
    
    function getEthAddr(string _RegistrarID)view public returns(address){
        return EthAddr[_RegistrarID];
    }
    
    
    function getSCAddr(string _RegistrarID)view public returns(address){
        return SCAddr[_RegistrarID];
    }
}

