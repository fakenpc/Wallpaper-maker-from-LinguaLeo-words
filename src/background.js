var windowState = 'normal'; // global

chrome.runtime.onMessage.addListener(
function( request, sender, sendResponse ) {

	if ( request.message == "download" ) {
		
		// make screenshot
		chrome.tabs.captureVisibleTab( null, { format: "png" }, function( dataUrl ) {

			chrome.tabs.query( { currentWindow: true, active: true }, function ( tabs ) {

				var activeTab = tabs[ 0 ];
				chrome.tabs.sendMessage( activeTab.id, { "message": "imageGenerated", "data": dataUrl } );

			} );

		} );


	}

	if ( request.message == "toggleFullscreenState" ) {
		
		// to fullscreen state
		chrome.windows.getCurrent( function( w ) {

			if ( w.state != 'fullscreen' ) {

				windowState = w.state;
				chrome.windows.update( w.id, { state: "fullscreen" } );

			}else {

				chrome.windows.update( w.id, { state: windowState } );

			}

		} );

	}

} );
