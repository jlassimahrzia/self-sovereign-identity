import React from 'react'
import { useState } from 'react';
import axios from 'axios';



function Up() {
    const [file, setFile] = useState();
      const [fileName, setFileName] = useState("");
 
      const saveFile = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
      };
 
      const uploadFile = async (e) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", fileName);
        try {
          const res = await axios.post(
            "http://localhost:8000/upload",
            formData
          );
          console.log(res);
        } catch (ex) {
          console.log(ex);
        }
      };

      return (
        <div >
        <form> <input type="file" onChange={saveFile} />
        <button onClick={uploadFile}>Upload</button></form>
         
        </div>
      );
    }


export default Up