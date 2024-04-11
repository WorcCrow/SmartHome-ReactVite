import { useEffect, useState } from 'react'
import { IoCaretBack, IoCaretForward, IoPower, IoReload, IoStopCircleOutline, IoStopOutline, IoVolumeHigh } from 'react-icons/io5';
import { IconContext } from 'react-icons';
import { Modal, Form, Alert, ListGroup } from 'react-bootstrap';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { CgScreen } from 'react-icons/cg';

function App() {
   const [bolShowPower, SetShowPower] = useState(false);
   const [bolShowVolumn, SetShowVolumn] = useState(false);
   const [arrLogs, SetLogs] = useState([]);
   useEffect(() => {
      RefreshCommandLog();
   }, []);

   const RefreshCommandLog = () => {
      SendCommand({ "command": "getCommandLogs" }, (objData) => {
         SetLogs((objData?.commands || []).reverse());
      });
   }

   return (
      <>
         <div className="d-flex flex-column align-items-center">
            <IconContext.Provider value={{ color: "red", size: "4em" }}>
               <div className="my-5">
                  <IoPower onClick={() => {
                     SetShowPower(true);
                  }} />
               </div>
               <div className="my-5">
                  <IoVolumeHigh onClick={() => {
                     SetShowVolumn(true);
                  }} />
               </div>
               <div className="my-5">
                  <CgScreen onClick={() => {
                     SendCommand({ "command": "nircmdc", "parameter": "monitor off" }, RefreshCommandLog);;
                  }} />
               </div>
            </IconContext.Provider>
         </div>
         <ListGroup className="px-2">
            {arrLogs.map((log, index) => (
               <ListGroup.Item key={index}>
                  {log}
               </ListGroup.Item>
            ))}
         </ListGroup>

         <WTModalPower bolShow={bolShowPower} SetShow={SetShowPower} RefreshCommandLog={RefreshCommandLog}/>
         <WTVolumeModal bolShow={bolShowVolumn} SetShow={SetShowVolumn} />
      </>
   )
}
const SendCommand = (objBody, callback = () => { }) => {
   fetch("http://192.168.1.4/WTools/api.php", {
      method: "POST",
      body: JSON.stringify(objBody)
   })
      .then(objData => objData.json())
      .then(callback);
}

const WTVolumeModal = ({ bolShow, SetShow }) => {
   const [intValue, SetValue] = useState(100);
   const [strStep, SetStep] = useState("10");

   useEffect(() => {
      SendCommand({ "command": "getVolume" }, objData => {
         SetValue(objData?.volume || 100);
      });
   }, []);
   const SendVolume = (intVolume) => {
      SendCommand({ "command": "nircmdc", "parameter": "changesysvolume", "volume": intVolume });
   }
   return (
      <Modal centered show={bolShow} onHide={() => SetShow(false)}>
         <Modal.Body className="d-flex flex-column align-items-center">
            <div className="d-flex align-items-center">{intValue}</div>
            <RangeSlider
               min={0}
               max={100}
               value={[0, intValue]}
               thumbsDisabled={[true, false]}
               rangeSlideDisabled={true}
               onInput={(arrValue) => {
                  SetValue(arrValue[1])
               }}
               onThumbDragEnd={() => {
                  SendVolume(intValue);
               }}
            />
            <div className="d-flex align-items-center my-4">
               <IconContext.Provider value={{ color: "red", size: "2em", className: "me-4" }}>
                  <div>
                     <IoCaretBack onClick={() => {
                        const intDifValue = intValue - +(strStep || 0);
                        SendVolume(intDifValue);
                        if (intDifValue > 0) {
                           SetValue(intDifValue);
                        } else {
                           SetValue(0);
                        }
                     }} />
                  </div>
               </IconContext.Provider>
               <Form.Control placeholder="Step Count" value={strStep} onInput={({ target }) => SetStep(target.value.replace(/[^0-9]/g, ""))} />
               <IconContext.Provider value={{ color: "red", size: "2em", className: "ms-4" }}>
                  <div>
                     <IoCaretForward onClick={() => {
                        const intDifValue = intValue + +(strStep || 0);
                        SendVolume(intDifValue);
                        if (intDifValue < 100) {
                           SetValue(intDifValue);
                        } else {
                           SetValue(100);
                        }
                     }} />
                  </div>
               </IconContext.Provider>
            </div>
         </Modal.Body>
      </Modal >
   )
}



const WTModalPower = ({ bolShow, SetShow, RefreshCommandLog }) => {
   const [strDelay, SetDelay] = useState("120");
   const [objResult, SetResult] = useState({});

   const callback = (objData) => {
      SetResult(objData);
      setTimeout(() => {
         SetResult({});
         RefreshCommandLog();
      }, 3000);
   }
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
                     SendCommand({ "command": "shutdown", "parameter": `/f /s /t ${strDelay}` }, callback)
                  }} />
               </div>
               <div className="my-4">
                  <IoReload onClick={() => {
                     SendCommand({ "command": "shutdowns", "parameter": `/f /r /t ${strDelay}` }, callback)
                  }} />
               </div>
               <div className="my-4">
                  <IoStopOutline onClick={() => {
                     SendCommand({ "command": "shutdown", "parameter": "/a" }, callback)
                  }} />
               </div>
            </IconContext.Provider>
            {!!objResult.success && (
               <Alert variant="success">
                  <Alert.Heading>Success</Alert.Heading>
                  <p>
                     {objResult.message}
                  </p>
               </Alert>
            )}
         </Modal.Body>
      </Modal>
   )
}
export default App
