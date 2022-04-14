import * as React from "react";
import QRCode from "qrcode.react";

export default function QrCode() {
  const qrRef = React.useRef();
  const [url, setUrl] = React.useState("");

 
  const qrCode = (
    <QRCode
      id="qrCodeElToRender"
      size={500}
      value={"https://google.com"}
      bgColor="white"
      fgColor="#141926"
      level="H"
    />
  );

  return (
    <div className="qr-container">
      <div className="qr-container__form">
        <button >Create Identity</button>
      </div>
      <div className="qr-container__qr-code" ref={qrRef}>
        {qrCode}
      </div>
    </div>
  );
}
