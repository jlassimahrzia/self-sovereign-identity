import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
import VCService from 'services/VCService';
import {
  Button,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";

function VC() {
    const [name, setName] = useState("")
    const [did, setId] = useState("")
    const [type, setType] = useState("")
    const [year, setYear] = useState("")

    

    const handleVC = async () => {
        try {
            if (!window.ethereum)
              throw new Error("No crypto wallet found. Please install it.");
        
            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature_name = await signer.signMessage(name); 
            const signature_type = await signer.signMessage(type); 
            const signature_year = await signer.signMessage(year); 
            const proof = await signer.signMessage(name+type+year)
           
            const address = await signer.getAddress();
            
            console.log("name"+signature_name) 
            console.log("type"+signature_type) 
            console.log("year"+signature_year) 
            console.log(address)

            const data = await VCService.createVC(address,did,type,signature_type, name,signature_name, year,signature_year,proof)
            
            console.log(data)
            return {
              
            signature_name,signature_type,signature_year,
              address,
              
            };
          } catch (err) {
            console.log("error");
          }
        
    }
    return (
        <div>
       
        <Form role="form">
        <FormGroup className="mb-3">
          <InputGroup className="input-group-alternative">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                DID
              </InputGroupText>
            </InputGroupAddon>
            <Input
             className="input"

            onChange={(e) => setId(e.target.value)}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup className="input-group-alternative">
            <InputGroupAddon addonType="prepend">
              Type
            </InputGroupAddon>
            <Input
             className="input"

            onChange={(e) => setType(e.target.value)}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup className="input-group-alternative">
            <InputGroupAddon addonType="prepend">
              Name
            </InputGroupAddon>
            <Input
             className="input"

            onChange={(e) => setName(e.target.value)}
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
        <InputGroup className="input-group-alternative">
          <InputGroupAddon addonType="prepend">
            Year
          </InputGroupAddon>
          <Input
           className="input"
    
          onChange={(e) => setYear(e.target.value)}
          />
        </InputGroup>
      </FormGroup>

        <div className="text-center">
          <Button className="my-4" color="primary" type="button" onClick={handleVC}>
            Create Verifiable Credentials
          </Button>
        </div>
      </Form>

         

      </div>
    )
}

export default VC