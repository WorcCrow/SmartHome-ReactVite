import { useState } from 'react'
import { IoCaretBack, IoCaretForward, IoPower, IoReload, IoStopCircleOutline, IoStopOutline, IoVolumeHigh } from 'react-icons/io5';
import { IconContext } from 'react-icons';
import { Modal, Form } from 'react-bootstrap';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

function App() {
   const [bolShowPower, SetShowPower] = useState(false);
   const [bolShowVolumn, SetShowVolumn] = useState(false);
   return (
      <>
         <div className="d-flex flex-column align-items-center">
            <IconContext.Provider value={{ color: "red", size: "4em" }}>
               <div className="mt-5 mb-5">
                  <IoPower onClick={() => {
                     SetShowPower(true);
                  }} />
               </div>
               <div className="mt-5">
                  <IoVolumeHigh onClick={() => {
                     SetShowVolumn(true);
                  }} />
               </div>
            </IconContext.Provider>
         </div>
         <WTModalPower bolShow={bolShowPower} SetShow={SetShowPower} />
         <WTVolumeModal bolShow={bolShowVolumn} SetShow={SetShowVolumn} />
      </>
   )
}
const SendCommand = (objBody) => {
   fetch("http://localhost/WTools/api.php", {
      method: "POST",
      body: JSON.stringify(objBody)
   })
      .then(objData => objData.json())
      .then(objData => console.log(objData));
}
const WTVolumeModal = ({ bolShow, SetShow }) => {
   const [arrValue, SetValue] = useState([0, 100]);
   const [arrPrevious, SetPrevious] = useState([0, 100]);
   const [strStep, SetStep] = useState("10");
   console.log("arrValue", arrValue)
   return (
      <Modal centered show={bolShow} onHide={() => SetShow(false)}>
         <Modal.Body className="d-flex flex-column align-items-center">
            <RangeSlider
               min={0}
               max={100}
               value={arrValue}
               thumbsDisabled={[true, false]}
               rangeSlideDisabled={true}
               onInput={(arrValue) => {
                  SetValue(arrValue)
               }}
               onThumbDragEnd={() => {
                  const intChanges = arrValue[1] - arrPrevious[1];
                  SendCommand({ "command": "nircmdc", "parameter": `changesysvolume ${intChanges}` })
                  SetPrevious(arrValue);
               }}
            />
            <div className="d-flex align-items-center my-4">
               <IconContext.Provider value={{ color: "red", size: "2em", className: "me-4" }}>
                  <div>
                     <IoCaretBack onClick={() => {
                        const intValue = arrValue[1] - +(strStep || 0);
                        SetValue([arrValue[0], intValue])
                        if (intValue > 0) {
                           SetValue([arrValue[0], intValue]);
                        } else {
                           SetValue([arrValue[0], 0]);
                        }
                     }} />
                  </div>
               </IconContext.Provider>
               <Form.Control placeholder="Step Count" value={strStep} onInput={({ target }) => SetStep(target.value.replace(/[^0-9]/g, ""))} />
               <IconContext.Provider value={{ color: "red", size: "2em", className: "ms-4" }}>
                  <div>
                     <IoCaretForward onClick={() => {
                        const intValue = arrValue[1] + +(strStep || 0);
                        if (intValue < 100) {
                           SetValue([arrValue[0], intValue]);
                        } else {
                           SetValue([arrValue[0], 100]);
                        }
                     }} />
                  </div>
               </IconContext.Provider>
            </div>

         </Modal.Body>
      </Modal >
   )
}



const WTModalPower = ({ bolShow, SetShow }) => {
   const [strDelay, SetDelay] = useState("120");
   return (
      <Modal centered show={bolShow} onHide={() => SetShow(false)}>
         <Modal.Body className="d-flex flex-column align-items-center">
            <Form.Control placeholder="Enter Second Delay"
               value={Number(strDelay || 0)}
               onInput={({ target }) => {
                  SetDelay(target.value.replace(/[^0-9]/g, ""))
               }} />
            <IconContext.Provider value={{ color: "red", size: "4em" }}>
               <div className="my-4">
                  <IoPower onClick={() => {
                     SendCommand({ "command": "shutdown", "parameter": `/f /s /t ${strDelay}` })
                  }} />
               </div>
               <div className="my-4">
                  <IoReload onClick={() => {
                     SendCommand({ "command": "shutdownssss", "parameter": `/f /r /t ${strDelay}` })
                  }} />
               </div>
               <div className="my-4">
                  <IoStopOutline onClick={() => {
                     SendCommand({ "command": "shutdown", "parameter": "/a" })
                  }} />
               </div>
            </IconContext.Provider>
         </Modal.Body>
      </Modal>
   )
}
export default App