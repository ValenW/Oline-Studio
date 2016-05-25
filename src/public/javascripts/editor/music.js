window.addEventListener("load", init, false);

var context;
var bufferList;

var start = 0;
var tempo = 110;
var unitTime  = 15 / tempo;

function init() {
	loadSource();
	initButtons();
}

function initButtons() {
	document.getElementById("play").onclick = function() {
		window.playBuoy(unitTime);
	}
	document.getElementById("pause").onclick = function() {
		window.pauseBuoy();
	}
	document.getElementById("stop").onclick = function() {
		window.stopBuoy();
	}
}

function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
	// Load buffer asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function() {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				// indicate progress
				$('#loading').progress('increment');

				if (++loader.loadCount == loader.urlList.length)
				loader.onload(loader.bufferList);
			},
			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	}

	request.onerror = function() {
		alert('BufferLoader: XHR error');
	}

	request.send();
}

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i)
	this.loadBuffer(this.urlList[i], i);
}

function loadSource() {
	// Fix up prefixing
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	$('#modal')
		.modal('setting', 'closable', false)
		.modal('show');

	urlList = new Array();
	for (var i = 0; i < 88; ++i) {
		urlList.push("sounds/piano1/"+getKeyName(i)+".mp3");
	}

	bufferLoader = new BufferLoader(context, urlList, finishedLoading);

	bufferLoader.load();
}

function finishedLoading(buffer) {
	bufferList = buffer;
	$('#modal').modal('hide');
}

function playSound(buffer, head, tail) {
	var startTime = context.currentTime + head * unitTime;
	var endTime = context.currentTime + tail * unitTime;

	var source = context.createBufferSource();
	var gainNode = context.createGain ? context.createGain() : context.createGainNode();
	source.connect(gainNode);
	gainNode.connect(context.destination);

	source.buffer = buffer;
	// gainNode.gain.linearRampToValueAtTime(1, endTime - 1);
	// gainNode.gain.linearRampToValueAtTime(0, endTime);

	if (!source.start)
		source.start = source.noteOn;
	source.start(startTime);
	source.stop(endTime);
}


window.playNote = function(note) {
	if (note)
		playSound(bufferList[note.key], 0, note.tail - note.head);
}

/* utility function */
// get key name from index
window.getKeyName = function(i) {
	var labels = ['B', 'A_', 'A', 'G_', 'G', 'F_', 'F', 'E', 'D_', 'D', 'C_', 'C'];
	var key = labels[(i+11)%12];
	key += (Math.floor((88+8-i)/12)+1).toString();
	return key;
}