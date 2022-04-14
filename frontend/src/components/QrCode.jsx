import { useRef, useState, useEffect } from 'react'
import QRCode from "qrcode.react";
import DidService from "../services/DidService"

export default function QrCode() {
  const qrRef = useRef();
  const [url, setUrl] = useState("");

  useEffect(() => {

  }, [])
 
  const qrCode = (
    <QRCode
      id="qrCodeElToRender"
      size={500}
      value={JSON.stringify(url)}
      bgColor="white"
      fgColor="#141926"
      level="H"
    />
  );

  const createIdentity = async () => {
    const data = await DidService.createIdentity()
    console.log(data)
    if(data){
      const done = await DidService.mappingDidToHash(data.cid.path, data.keyPair.identifier)
      if(done)
        setUrl({privateKey: data.keyPair.privateKey, identifier: data.keyPair.identifier})
      const ddo = await DidService.resolve(data.keyPair.identifier)
      console.log(ddo)
    }
    
  }
    
  return (
    <div className="qr-container">
      <div className="qr-container__form">
        <button type="button" onClick={createIdentity}>Create Identity</button>
      </div>
      {url ?
        <div className="qr-container__qr-code" ref={qrRef}>
          {qrCode}
        </div> : null}
    </div>
  );
}
