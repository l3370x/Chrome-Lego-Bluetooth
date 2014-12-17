$(function() {
	printBTLog("Chrome BT App 0.1");
	printBTLog(" - Use https://developer.chrome.com/apps/app_bluetooth for all operations");
	printBTLog(" - This App uses the chrome.bluetoothSocket APIs");
	printBTLog(" - To connect devices, they MUST be paired AFTER opening this app.");
	printBTLog(" - At LEAST Chrome 37 is required for this application");
	
	var opts = {
	  lines: 6,
	  angle: 0.15,
	  lineWidth: 0.44,
	  pointer: {
		length: 0.9,
		strokeWidth: 0.035,
		color: '#000000'
	  },
	  limitMax: 'false', 
	  percentColors: [[0.0, "#DF0101" ], [0.50, "#FFFF00"], [1.0, "#01DF01"]], // !!!!
	  strokeColor: '#E0E0E0',
	  generateGradient: true
	};
	var gauge1 = document.getElementById('gauge1');
	var gauge2 = document.getElementById('gauge2');
	var gauge3 = document.getElementById('gauge3');
	var gauge11 = new Gauge(gauge1).setOptions(opts);
	gauge11.maxValue = 200;
	gauge11.animationSpeed = 40;
	gauge11.set(100);
	var gauge22 = new Gauge(gauge2).setOptions(opts);
	gauge22.maxValue = 200;
	gauge22.animationSpeed = 40;
	gauge22.set(100);
	var gauge33 = new Gauge(gauge3).setOptions(opts);
	gauge33.maxValue = 200;
	gauge33.animationSpeed = 40;
	gauge33.set(100);


	var hotkeys = [81,65,87,83,69,68];
	
	var motor1 = "s";
	var motor2 = "s";
	var motor3 = "s";
	
	function keyPress(code,state){
		switch(code){
		case 81:
		// q
		if(motor1!=="f" & state == 1){var rev = (document.getElementById("motor1Reversed").checked) ? 1 : -1;sendMotorCommand(0,100*rev);motor1="f";printBTLog("Motor 1 FORWARD");gauge11.set(200);};
		if(motor1!=="s" & state == 0){sendMotorCommand(0,0);motor1="s";printBTLog("Motor 1 STOP");gauge11.set(100);};
		break;
		case 65:
		// a
		if(motor1!=="b" & state == 1){var rev = (document.getElementById("motor1Reversed").checked) ? 1 : -1;sendMotorCommand(0,-100*rev);motor1="b";printBTLog("Motor 1 BACK");gauge11.set(0);};
		if(motor1!=="s" & state == 0){sendMotorCommand(0,0);motor1="s";printBTLog("Motor 1 STOP");gauge11.set(100);};
		break;
		
		
		case 87:
		// w
		if(motor2!=="f" & state == 1){var rev = (document.getElementById("motor2Reversed").checked) ? 1 : -1;sendMotorCommand(1,100*rev);motor2="f";printBTLog("Motor 2 FORWARD");gauge22.set(200);};
		if(motor2!=="s" & state == 0){sendMotorCommand(1,0);motor2="s";printBTLog("Motor 2 STOP");gauge22.set(100);};
		break;
		case 83:
		// s
		if(motor2!=="b" & state == 1){var rev = (document.getElementById("motor2Reversed").checked) ? 1 : -1;sendMotorCommand(1,-100*rev);motor2="b";printBTLog("Motor 2 BACK");gauge22.set(0);};
		if(motor2!=="s" & state == 0){sendMotorCommand(1,0);motor2="s";printBTLog("Motor 2 STOP");gauge22.set(100);};
		break;
		
		
		case 69:
		// e
		if(motor3!=="f" & state == 1){var rev = (document.getElementById("motor3Reversed").checked) ? 1 : -1;sendMotorCommand(2,100*rev);motor3="f";printBTLog("Motor 3 FORWARD");gauge33.set(200);};
		if(motor3!=="s" & state == 0){sendMotorCommand(2,0);motor3="s";printBTLog("Motor 3 STOP");gauge33.set(100);};
		break;
		case 68:
		// d
		if(motor3!=="b" & state == 1){
			var rev = (document.getElementById("motor1Reversed").checked) ? 1 : -1;
			sendMotorCommand(2,-100*rev);
			motor3="b";
			printBTLog("Motor 3 BACK");
			gauge33.set(0);};
		if(motor3!=="s" & state == 0){sendMotorCommand(2,0);motor3="s";printBTLog("Motor 3 STOP");gauge33.set(100);};
		break;
		}
	}
	function GetDescriptionFor(e,state)
	{
	  var result, code;
	  if ((e.charCode) && (e.keyCode==0))
	  {
		result = "charCode: " + e.charCode;
		code = e.charCode;
	  } else {
		result = "keyCode: " + e.keyCode;
		code = e.keyCode;
		if( jQuery.inArray(code,hotkeys) >= 0){
			keyPress(code,state);
		}
	  }
	  if (code == 8) result += " BKSP"
	  else if (code == 9) result += " TAB"
	  else if (code == 46) result += " DEL"
	  else if ((code >= 41) && (code <=126)) result += " '" + String.fromCharCode(code) + "'";
	  if (e.shiftKey) result += " shift";
	  if (e.ctrlKey) result += " ctrl";
	  if (e.altKey) result += " alt";

	  return result;
	}
	
	function MonitorKeyDown(e)
	{
	  if (!e) e=window.event;
	  var d = GetDescriptionFor(e,1);
	  return false;
	}
	
	function MonitorKeyUp(e)
	{
	  if (!e) e=window.event;
	  var d = GetDescriptionFor(e,0);
	  return false;
	}
	
	document.addEventListener('keydown', MonitorKeyDown, false)
	document.addEventListener('keyup', MonitorKeyUp, false)

	var btDeviceSelect = $('#btDeviceSelect');


	var socketID         = 0;
	
	var deviceArray      = {};
	var device_names     = {};
	var device_Addresses = {};
	var deviceCount      = 0;
	var deviceOffset     = 0;

	var screenWidth = screen.availWidth;
	var screenHeight = screen.availHeight;

//  Start up Code	

	var addDeviceName = function(device) {
		deviceArray[deviceCount++] = device;
//                var btDeviceName = device.name;
//                $('<option></option>').text(btDeviceName).appendTo(btDeviceSelect);
        $('<option></option>').text(device.name).appendTo(btDeviceSelect);
	}
	var updateDeviceName = function(device) {
		printBTLog('  Have a device update - ' + device.name);
		//deviceArray[deviceCount++] = device;
		//$('<option></option>').text(device[i].name).appendTo(btDeviceSelect);

	}
	var removeDeviceName = function(device) {
		delete device_names[device.address];
	}
	// Add listeners to receive newly found devices and updates
	// to the previously known devices.
	chrome.bluetooth.onDeviceAdded.addListener(addDeviceName);
	chrome.bluetooth.onDeviceChanged.addListener(updateDeviceName);
	chrome.bluetooth.onDeviceRemoved.addListener(removeDeviceName);
	
    // Get the list of paired devices.
//	printBTLog("");
//	chrome.bluetooth.getDevices(function(devices) {
//		for (var i = 0; i < devices.length; i++) {
//		    printBTLog('Found: ' + device[i].name);
//		    deviceArray[deviceCount++] = device[i];
//			$('<option></option>').text(device[i].name).appendTo(btDeviceSelect);
//		    updateDeviceName(devices[i]);
//		}
//    });
	chrome.bluetooth.startDiscovery(function() {
	// Stop discovery after 3 seconds.
//        printBTLog('Starting Bluetooth Device Scan.');
        setTimeout(function() {
            chrome.bluetooth.stopDiscovery(function() {});
//            printBTLog('Finished Scanning for Bluetooth Devices.');
            $('#selectedBTDevice').empty().text(btDeviceSelect.val());
        }, 30000);
    });
	

	
//  Functions	
	function convertArrayBufferToString (buf) {
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}
	

	function convertArrayBufferToDumpString (buf) {
		var dumpString = '['
		var charArray = new Uint8Array(buf);
		for (var i = 0; i < charArray.length; i++) {
			dumpString += charArray[i].toString();
			if (i < charArray.length - 1) dumpString += ', ';
		}
		dumpString += ']';
		return dumpString;
	}

	function convertStringToArrayBuffer (str) {
		var buf = new ArrayBuffer(str.length);
		var bufView = new Uint8Array(buf);
		for (var i = 0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}
	function convertBytesToArrayBuffer(bytes) {
		var abv=new Uint8Array(bytes);
		return abv.buffer;
	}

	function printBTLog(logmsg) {
		var btLog = $('#btLog');
		var btLogContent = $('#btLogContent');

		btLogContent.append(document.createTextNode(logmsg + '\n'));
		btLog.scrollTop(btLog[0].scrollHeight);
	}

	function printConnectionBTLog(id, msg) {
		printBTLog('(' + id + ') ' + msg);
	}
	
	function sendMotorCommand(motor,speed){
	
		if (socketID) {
			var cmd=[0x0c, 0x00, 0x80, 0x04, motor, speed, 0x07, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00];
			//var txdata = cmd;
			printBTLog('>> Sending message: "' + cmd + '"');
			//var txstring = txdata + '\r';
			var txbuffer = convertBytesToArrayBuffer(cmd);

			chrome.bluetoothSocket.send(socketID, txbuffer, function (bytes_sent) {
				if (chrome.runtime.lastError) {
					printBTLog("send Operation failed: " + chrome.runtime.lastError.message);
				} 
				else {
					printBTLog('Sent ' + bytes_sent + ' bytes');
				}
			});
		}
		else {
			printBTLog('Not connected. aaa');
		}	
	}
			

	$('#btDeviceSelect')
		.change(function () {
			$('#selectedBTDevice').empty().text($('#btDeviceSelect').val());
		});

	$('#btConnect')
		.click(function () {
			var btDeviceName    = $('#btDeviceSelect').val();
			    deviceOffset    = $("#btDeviceSelect")[0].selectedIndex;
			var btDeviceAddress = deviceArray[deviceOffset].address;
			printBTLog('');
			printBTLog('Starting Connection to ' + btDeviceName);
			if (!btDeviceName) {
				printBTLog('No Bluetooth Device Selected.');
				return;
			}
			else if (!socketID) {
				chrome.bluetoothSocket.create(function(createInfo) {
				    if (chrome.runtime.lastError) {
						AddConnectedSocketId(socketID = 0);
						printBTLog("Socket Create Failed: " + chrome.runtime.lastError.message);
					}
					else {
						socketID = createInfo.socketId;
						chrome.bluetoothSocket.connect(createInfo.socketId,
						    btDeviceAddress, "1101", onConnectedCallback);
					}
				});
				if (chrome.runtime.lastError) {
				    AddConnectedSocketId(socketID = 0);
					printBTLog("Connection Operation failed: " + chrome.runtime.lastError.message);
				} 
			}
			else {
				printBTLog('Already connected.');
			}
		});
		var onConnectedCallback = function() {
				if (chrome.runtime.lastError) {
						AddConnectedSocketId(socketID = 0);
						printBTLog("Connection failed: " + chrome.runtime.lastError.message);
				}
				else {
						// Profile implementation here.
						printBTLog("Connected with socketID = " + socketID);
						AddConnectedSocketId(socketID);
						$('#socketId').text(socketID);
						$('#btStatus').text("Connected");
				}
		}

	$('#btDisconnect')
		.click(function () {
			printBTLog('');
			if (socketID) {
				printBTLog('Disconnecting connection id ' + socketID + '...');
				chrome.bluetoothSocket.disconnect(socketID);
				if (chrome.runtime.lastError) {
				    printBTLog("Disconnect failed: " + chrome.runtime.lastError.message);
				}
				else {
					printBTLog('Disconnect successful');
				    AddConnectedSocketId(0);
					$('#socketId').text("-");
					$('#btStatus').text("Disconnected");
				}
				socketID = 0;
			}
			else {
				printBTLog('Not connected.');
			}
		});


	$('#btGetDevice')
		.click(function () {
		    deviceOffset   = $("#btDeviceSelect")[0].selectedIndex;
			var deviceInfo = deviceArray[deviceOffset];
			printBTLog("");
			printBTLog(deviceArray[deviceOffset].name + " Has Address " + deviceInfo.address);
			if (deviceInfo.deviceClass) {
				printBTLog(" Device Class:" + deviceInfo.deviceClass);
			}
			if (deviceInfo.vendorId) {
				printBTLog(" Vendor ID:" + deviceInfo.vendorId);
			}
			if (deviceInfo.productId) {
				printBTLog(" Product ID:" + deviceInfo.productId);
			}
			if (deviceInfo.deviceId) {
				printBTLog(" Device ID:" + deviceInfo.deviceId);
			}
			if (deviceInfo.paired) {
				printBTLog(" Paired:" + deviceInfo.paired);
			}
			if (deviceInfo.connected) {
				printBTLog(" Connected:" + deviceInfo.connected);
			}
			for (var i = 0; deviceInfo.uuids.length > i; ++i) {
				printBTLog(" uuid:" + deviceInfo.uuids[i]);
			}
			if (chrome.runtime.lastError) {
				printBTLog("getDevice Operation failed: " + chrome.runtime.lastError.message);
			} 
		});

	$('#btSendMessage')
		.click(function () {
			if (socketID) {
				var txdata = $('#sendMessageContent').val();
				printBTLog('>> Sending message: "' + txdata + '"');
				var txstring = txdata + '\r';
				var txbuffer = convertStringToArrayBuffer(txstring);

				chrome.bluetoothSocket.send(socketID, txbuffer, function (bytes_sent) {
				    if (chrome.runtime.lastError) {
					    printBTLog("send Operation failed: " + chrome.runtime.lastError.message);
				    } 
					else {
						printBTLog('Sent ' + bytes_sent + ' bytes');
					}
				});
			}
			else {
				printBTLog('Not connected.');
			}			
		});
		
	//$('#btSendMotor1on')
	//	.click(function(){		
	//		sendMotorCommand(0,100);
	//});
	$('#btSendMotor1off')
		.click(function(){		
			sendMotorCommand(0,0);
	});
	//$('#btSendMotor2on')
	//	.click(function(){		
	//		sendMotorCommand(1,100);
	//});
	$('#btSendMotor2off')
		.click(function(){		
			sendMotorCommand(1,0);
	});
	//$('#btSendMotor3on')
	//	.click(function(){		
	//		sendMotorCommand(2,100);
	//});
	$('#btSendMotor3off')
		.click(function(){		
			sendMotorCommand(2,0);
	});

		
	var rxbuilder = '';
	function onBTReceive(info) {
		printBTLog('Received ' + info.data.byteLength + ' bytes of data: ' + convertArrayBufferToDumpString(info.data));
		var rxstring = convertArrayBufferToString(info.data);
		rxbuilder += rxstring;
		if (rxbuilder.charCodeAt(rxbuilder.length - 1) == 13) {
			var rxdata = rxbuilder.slice(0, -1);
			printBTLog('<< Received message: "' + rxdata + '"');
			rxbuilder = '';
		}
		else {
			printBTLog('Message is not terminated. Message so far is: "' + rxbuilder + '"');
		}
	}

	function onBTReceiveError(errorInfo) {
		printBTLog(errorInfo.errorMessage);
	}

	chrome.bluetoothSocket.onReceive.addListener(onBTReceive);
	chrome.bluetoothSocket.onReceiveError.addListener(onBTReceiveError);

});