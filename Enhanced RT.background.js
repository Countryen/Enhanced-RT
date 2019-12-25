// see: https://www.chromium.org/Home/chromium-security/extension-content-script-fetches

// New extension background page, fetching from a known URL and relaying data:
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    switch (request.contentScriptQuery) {
      case "getUsersAutoPlayNextVideoPref": {getUsersAutoPlayNextVideoPref(request, sender, sendResponse); break;}
      case "updateUsersAutoPlayNextVideoPreference": {updateUsersAutoPlayNextVideoPreference(request, sender, sendResponse); break;}
      case "getListOfChannels1": { getListOfChannels1(request, sender, sendResponse); break;}
      case "getListOfChannels2": { getListOfChannels2(request, sender, sendResponse); break;}
      case "getListOfEpisodes": { getListOfEpisodes(request, sender, sendResponse); break;}
      case "getWatchTimes": { getWatchTimes(request, sender, sendResponse); break;}
      default: {throw "BAD CASE";}
    }
    return true;  // Will respond asynchronously.
  }
);

function getWatchTimes(request, sender, sendResponse)
{
  // Request episode watch times from Watch Time Collector (wtc) server.
  var watchTimeXMLHttp = new XMLHttpRequest();
  
  watchTimeXMLHttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200)
    {
      var watchTimeObj = JSON.parse(this.responseText);
      
      sendResponse(watchTimeObj);
			
		}
	};

  // Request watch times for current episode batch
  watchTimeXMLHttp.open("GET", "https://wtcg.roosterteeth.com/api/v1/my/played_positions/mget/" + request.episodeBatch, true);
  watchTimeXMLHttp.setRequestHeader('Authorization', 'Bearer ' + request.accessToken);
  watchTimeXMLHttp.send();
}

function getListOfEpisodes(request, sender, sendResponse)
{
  // Get List of Episodes
	var xmlhttp = new XMLHttpRequest();
  
  xmlhttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200)
    {
      var myObj = JSON.parse(this.responseText);
      
      sendResponse(myObj);
			
		}
	};

	// Request episodes list from server
	xmlhttp.open("GET", "https://svod-be.roosterteeth.com/api/v1/episodes?page=" + request.episodePage + "&per_page=" + request.episodesPerPage, true);
	xmlhttp.send();
}

function getListOfChannels2(request, sender, sendResponse)
{
  // Get series that belong to this channel
  var seriesXMLHttp = new XMLHttpRequest();
  
  seriesXMLHttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200)
    {
      var seriesObj = JSON.parse(this.responseText);
      
      sendResponse(seriesObj);
			
		}
	};

	// Request series list from server
  seriesXMLHttp.open("GET", "https://svod-be.roosterteeth.com/api/v1/channels/" + request.channelSlug + "/shows", true);
  seriesXMLHttp.send();
}

function getListOfChannels1(request, sender, sendResponse)
{
  // Get List of Channels
	var channelsXMLHttp = new XMLHttpRequest();
      	
	channelsXMLHttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var channelsObj = JSON.parse(this.responseText);
      
      sendResponse(channelsObj);
			
		}
	};

	// Request channels list from server
	channelsXMLHttp.open("GET", "https://svod-be.roosterteeth.com/api/v1/channels", true);
	channelsXMLHttp.send();
}
  
  
function updateUsersAutoPlayNextVideoPreference(request,sender,sendResponse)
{
    // Update users Auto Play Next Video preference and store locally
    var meXMLHttp = new XMLHttpRequest();
    
    meXMLHttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) // Successfully downloaded user preference
      {
          var meObj = JSON.parse(this.responseText);
          // Store users Auto Play Next Video preference locally
          localStorage.setItem("enhancedRT_autoPlayNextVideo", meObj.attributes.preferences.autoplay.toString());
          sendResponse();
      }
    };

    // Request user's preferences from server
    meXMLHttp.open("GET", "https://business-service.roosterteeth.com/api/v1/me", true);
    meXMLHttp.send();
}    
  
function getUsersAutoPlayNextVideoPref(request, sender, sendResponse)
{
  var meXMLHttp = new XMLHttpRequest();
  var autoPlayNextVideo = "";
  var element = request.element;
    
  meXMLHttp.onreadystatechange = function() {
      
    if (this.readyState == 4 && this.status == 200) // Successfully downloaded user preference
    {
      var meObj = JSON.parse(this.responseText);
      //console.log("Connected, get preference from server");
      //console.log("Auto Play Next Video is " + meObj.attributes.preferences.autoplay);

      autoPlayNextVideo = meObj.attributes.preferences.autoplay.toString();
      // Store users Auto Play Next Video preference locally
      localStorage.setItem("enhancedRT_autoPlayNextVideo", autoPlayNextVideo);
      
      if(autoPlayNextVideo == "false")
      {
        // Stop next video auto play
        element.childNodes[0].childNodes[0].childNodes[0].click();

        // Delete next up div so it does not display
        element.parentNode.removeChild(element);
        
        //console.log("Auto Play Next Video has been killed");
        //alert("Auto Play Next Video has been killed");
      }
    }

    if (this.readyState == 4 && this.status != 200) // Failed to downloaded user preference
    {
      // Could not connect, get preference from local storage
      autoPlayNextVideo = ((localStorage.getItem("enhancedRT_autoPlayNextVideo") == null) ? "true" : localStorage.getItem("enhancedRT_autoPlayNextVideo"));
      //console.log("Could not connect, get preference from local storage");
      //console.log("Auto Play Next Video is " + autoPlayNextVideo);
      
      if(autoPlayNextVideo == "false")
      {
        // Stop next video auto play
        element.childNodes[0].childNodes[0].childNodes[0].click();

        // Delete next up div so it does not display
        element.parentNode.removeChild(element);
        
        //console.log("Auto Play Next Video has been killed");
        //alert("Auto Play Next Video has been killed");
      }
    }
    sendResponse(autoPlayNextVideo, element);
  };

  // Request user's preferences from server
  meXMLHttp.open("GET", "https://business-service.roosterteeth.com/api/v1/me", true);
  meXMLHttp.send();
}