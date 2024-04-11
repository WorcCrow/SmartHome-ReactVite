<?php

function save2storage($data)
{
   $file = fopen("storage.json", "w") or die("Unable to open file!");
   $txt = json_encode($data);
   fwrite($file, $txt);
}

function getStorageData()
{
   if(!file_exists("storage.json")) return json_decode("", true);
   return json_decode(file_get_contents("storage.json"), true);
}

function getObjectValue($obj, $key){
   if(!isset($obj[$key])) return null;
   return $obj[$key];
}

$database = getStorageData();

$JSON = json_decode(file_get_contents('php://input'));
$data = [];
if (isset($JSON->command)) {

   $data["success"] = false;
   $data["message"] = "";
   if (isset($JSON->parameter)) {
      if ($JSON->command === "shutdown") {
         $command = "$JSON->command $JSON->parameter";
         $data["success"] = true;
         $data["message"] = "Shutdown Command Executed: $command";
         $database["commands"][] = $data["message"];
         system($command);
      } else if ($JSON->command === "nircmdc") {
         if (strstr($JSON->parameter, "changesysvolume") && isset($JSON->volume)) {
            $data["success"] = true;
            $data["message"] = "Volume Command Executed";
            $database["volume"] = $JSON->volume;
            system("C:\\nircmdc.exe changesysvolume -65535");
            system("C:\\nircmdc.exe changesysvolume " . $JSON->volume * 65535 / 100);
         } else {
            $command = "C:\\nircmdc.exe $JSON->parameter";
            $data["success"] = true;
            $data["message"] = "Nircmd Command Executed: $command";
            system($command);
            $database["commands"][] = $data["message"];
         }
      }
   } else if (strstr($JSON->command, "getVolume")) {
      $data["volume"] = getObjectValue($database,"volume");
   } else if (strstr($JSON->command, "getCommandLogs")) {
      $data["commands"] = getObjectValue($database,"commands");
   }

   $result = getObjectValue($database, "commands");
   $arrayToSlice = is_array($result) ? $result : array();

   $database["commands"] = array_slice($arrayToSlice, -10);

   save2storage($database);
}
header("Content-Type: application/json");

echo json_encode($data);
exit();
