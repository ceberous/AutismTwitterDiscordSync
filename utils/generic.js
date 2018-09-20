const resolver = require( "resolver" );


// https://stackoverflow.com/a/14646633/9222528
function IsValidDomain(domain) { 
    var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/); 
    return domain.match(re);
}
module.exports.isValidDomain = IsValidDomain;

function W_SLEEP( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = W_SLEEP;


function RESOLVE_LINK( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			//console.log( "Trying to Resolve --> " );
			//console.log( wURL );
			//var discord_remove_preview = false;
			if ( wURL.indexOf( "&lt;" ) !== -1 ) {
				wURL = wURL.split( "&lt;" )[ 1 ];
			}
			if ( wURL.indexOf( "&gt;" ) !== -1 ) {
				wURL = wURL.split( "&gt;" )[ 0 ];
				//discord_remove_preview = true;
			}
			resolver.resolve( wURL , function( err , url , filename , contentType ) {
				if ( err ) { resolve( "fail" ); return; }
				if ( url === wURL ) { resolve( "fail" ); return; }
				//if ( discord_remove_preview ) { url = "<" + url + ">"; }
				resolve( url );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const TWITTER_STATUS_BASE = "https://twitter.com/";
function SCAN_TEXT_AND_RESOLVE_LINKS( wText ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wText ) { resolve( "" ); return; }
			var wFinal = "";
			var wAddonLinks = wText.split( "\n" );
			wText = wAddonLinks[ 0 ].split( " " );
			for ( var i = 0; i < wText.length; ++i ) {
				//console.log( i.toString() + ".) = " + wText[ i ] );
				const x1_idx = wText[ i ].indexOf( "http" ); 
				if ( x1_idx !== -1 ) {
					//console.log( "We Found a Short Link" );
					wText[ i ] = wText[ i ].substring( x1_idx , wText[ i ].length );
					//console.log( wText[ i ] );
					var j11 = await RESOLVE_LINK( wText[ i ] );
					if ( j11 === "fail" ) {
						var j12 = wText[ i ].substring( 0 , ( wText[ i ].length - 1 ) );
						//console.log( j12 );
						j11 = await RESOLVE_LINK( j12 );
						if ( j11 === "fail" ) { j11 = wText[ i ]; }
					}
					wText[ i ] = j11;
					//console.log( wText[ i ] );
				}
				if ( wText[ i ] !== TWITTER_STATUS_BASE ) {
					wFinal = wFinal + wText[ i ] + " ";
				}
			}
			for ( var i = 1; i < wAddonLinks.length; ++i ) {
				var xTemp = wAddonLinks[ i ].split( " " );
				for ( var j = 0; j < xTemp.length; ++j ) {
					const x2_idx = xTemp[ j ].indexOf( "http" ); 
					if ( x2_idx !== -1 ) {
						//console.log( "We Found a Short Link" );
						xTemp[ j ] = await RESOLVE_LINK( xTemp[ j ] );
						//console.log( xTemp[ j ] );
					}
					if ( xTemp[ j ] !== TWITTER_STATUS_BASE ) {
						wFinal = wFinal + xTemp[ j ] + " ";
					}
				}
			}
			wFinal = wFinal.trim();
			resolve( wFinal );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.scanTextAndResolveLinks = SCAN_TEXT_AND_RESOLVE_LINKS;