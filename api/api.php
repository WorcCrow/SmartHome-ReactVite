<?php
$JSON = json_decode(file_get_contents('php://input'));

$myfile = fopen("command.log", "w") or die("Unable to open file!");
$txt = json_encode($JSON) . "\n";
fwrite($myfile, $txt);
$data = [
   "success" => false,
   "message" => ""
];
if(isset($JSON->command) && isset($JSON->parameter)){
   if($JSON->command === "shutdown"){
      $data["success"] = true;
      $data["message"] = "Shutdown Command Executed: $JSON->command $JSON->parameter";
      system("$JSON->command $JSON->parameter");
   }else if($JSON->command === "nircmdc"){
      if(strstr($JSON->parameter, "changesysvolume")){
         $data["success"] = true;
         $data["message"] = "Volume Command Executed";
         system("C:\\nircmdc.exe changesysvolume -65535");
         system("C:\\nircmdc.exe $JSON->parameter");
      }else{
         $data["success"] = true;
         $data["message"] = "Nircmd Command Executed";
         system("C:\\nircmdc.exe $JSON->parameter");
      }
   }
}
header("Content-Type: application/json");

echo json_encode($data);
exit();
