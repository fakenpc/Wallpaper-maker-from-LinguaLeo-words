var jsonDictonaryData = []; // global
var defaultImageWidth = 150; // global

var $grid = $( '.grid' ).masonry( {
	// Options
	itemSelector: '.image-container'
} );

loadDictonary = function( pageNum, loadedCallback ) {

	$.post(
			'https://lingualeo.com/userdict/json', {
				sortBy: 'date',
				wordType: '0',
				filter: 'all',
				page: pageNum,
				groupId: 'dictionary'
			},
			function( jsonData ) {

				countWords = jsonData.count_words;
				jsonDictonaryData.push( jsonData );

				if ( jsonData.show_more ) {

					loadDictonary( pageNum + 1, loadedCallback );

				} else {

					if ( typeof loadedCallback !== 'undefined' ) {

						loadedCallback( jsonDictonaryData );

					}

				}

			},
			'json'
		)
		.fail( function() {

			alert( 'error' );

		} )
		.always( function() {

		} );

};

// Overlay popup
showOverlay = function( element ) {

	$( element ).css( 'height', '100%' );
	$( 'body' ).css( 'overflow', 'hidden' );

};

hideOverlay = function( element ) {

	$( element ).css( 'height', '0%' );
	$( 'body' ).css( 'overflow', 'auto' );

};

showOverlayHead = function( element ) {

	$( element ).css( 'display', 'block' );

};

hideOverlayHead = function( element ) {

	$( element ).css( 'display', 'none' );

};

renderSelectedDictonaryWords = function( imgWidth ) {

	$( '.grid' ).html( '' );
	$grid.masonry( 'destroy' );

	selectedWordIds = [];

	$( '.dict-item-word.checked' ).each( function() {

		id = $( this ).data( 'word-id' );
		selectedWordIds.push( id );

	} );

	jsonDictonaryData.forEach( function( jsonData ) {

		jsonData.userdict3.forEach( function( element ) {

			element.words.forEach( function( word ) {

				if ( $.inArray( word.word_id, selectedWordIds ) != - 1 ) {

					transcription = $( '#show-transcription' ).is( ':checked' ) ? '<p>' + word.transcription + '</p>' : '';
					translation = '';

					if ( $( '#show-translation' ).is( ':checked' ) ) {

						word.user_translates.forEach( function( translatedWord ) {

							translation = translation + '<p>' + translatedWord.translate_value + '</p>';

						} );

					}

					$( '.grid' ).append( '<div class="image-container">' +
						'<img width="' + imgWidth + '" src="' + word.picture_url + '">' +
						'<p>' + word.word_value + '</p>' +
						transcription +
						translation +
						'</div>' );

				}

			} );

		} );

	} );

	$grid = $( '.grid' ).masonry( {
		// Options
		itemSelector: '.image-container'
	} );

};

addShowOverlayButton = function() {

	if ( $( '#show-wallpaper-overlay' ).length == 0 ) {

		$( '.dict-title .dict-title-inner' ).append( '<a class="btn gloss-traning" id="show-wallpaper-overlay" href="#"><i class="icon-print"></i><span>Generate Wallpaper</span></a>' );

		$( '#show-wallpaper-overlay' ).on( 'click', function() {

			if ( $( '.dict-item-word.checked' ).length ) {

				showOverlay( '#wallpaper-overlay' );

				jsonDictonaryData = []; // global

				loadDictonary( 1, function( jsonDictonaryData ) {

					imageWidth = $( '#image-width' ).val() ? $( '#image-width' ).val() : defaultImageWidth;
					renderSelectedDictonaryWords( imageWidth );

				} );

			} else {

				alert( 'Select the words to display' );

			}

		} );

	}

};

addOverlay = function() {

	if ( $( '#wallpaper-overlay' ).length == 0 ) {

		$( 'body' ).append( `
			<div id="wallpaper-overlay" class="overlay">
				<a href="javascript:void(0)" class="closebtn" id="hide-wallpaper-overlay">&times;</a>
				<div class="overlay-head">
					<label for="image-width">Size: </label>
					<input type="number" value="` + defaultImageWidth + `" step=10 id="image-width">
					<label for="show-transcription">Show transcription: </label>
					<input type="checkbox" id="show-transcription">
					<label for="show-translate">Show translate: </label>
					<input type="checkbox" id="show-translation">
					<a href="#" id="toggle-fullscreen-state">Full Screen</a>
					<a href="#" id="download-wallpaper">Download</a>
				</div>
				<div class="overlay-content">
					<div class="grid"></div>
				</div>
			</div>
		` );

		$( '#hide-wallpaper-overlay' ).on( 'click', function() {

			hideOverlay( '#wallpaper-overlay' );

		} );

		$( '#download-wallpaper' ).on( 'click', function() {

			hideOverlayHead( '.overlay-head' );
			setTimeout( showOverlayHead, 2000, '.overlay-head' );
			chrome.runtime.sendMessage( {
				message: 'download'
			} );

		} );

		$( '#toggle-fullscreen-state' ).on( 'click', function() {

			chrome.runtime.sendMessage( {
				message: 'toggleFullscreenState'
			} );

		} );

		$( 'input#image-width' ).on( 'change', function() {

			renderSelectedDictonaryWords( $( this ).val() );

		} );

		$( '#show-transcription' ).on( 'change', function() {

			imageWidth = $( '#image-width' ).val() ? $( '#image-width' ).val() : defaultImageWidth;
			renderSelectedDictonaryWords( imageWidth );

		} );

		$( '#show-translation' ).on( 'change', function() {

			imageWidth = $( '#image-width' ).val() ? $( '#image-width' ).val() : defaultImageWidth;
			renderSelectedDictonaryWords( imageWidth );

		} );

	}

};

init = function() {

	jsonDictonaryData = []; // global

	addOverlay();
	addShowOverlayButton();

};

init();

chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {

	if ( request.message === 'imageGenerated' ) {

		download( request.data, 'lingualeo-cards.png', 'image/png' );

	}

} );
