pragma solidity ^ 0.4.18;


contract PPR{
    string public PatientID;
    string public ProviderID;
    
    struct AccessInfo{
        string hostname;//Dummy for now
        string port;//Dummy for now
    }
    
    mapping (uint => int) Permission;/*Input the index of piece of data offchain,
    return its Permission*/
    /*  Permission Values
     0:private to owner, with id being the PatientID stated in the PPR.
     1:public to anyone
     */
    
    mapping (uint => uint) DataHash;/*Input the index of the piece of data offchain, return the hash for the offchain piece of data.*/
    
     constructor(string _PatientID, string _ProviderID)public{
        PatientID=_PatientID;
        ProviderID=_ProviderID;
    }

    function getPermission(uint _index)view public returns(int){
        return Permission[_index];
    }
    
    function getDataHash(uint _index)view public returns(uint){
        return DataHash[_index];
    }
    
    function updatePermission(uint _index,int newPermission)public{
        Permission[_index]=newPermission;
    }
    
    /*I am not totally understand here, who is responsible for calcuating and updating the data hash?*/
    function updateDataHash(uint _index,uint newHash)public{
        DataHash[_index]=newHash;
    }
}
