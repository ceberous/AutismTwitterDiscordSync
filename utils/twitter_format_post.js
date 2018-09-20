const ScanTextAndResolveLinks = require( "./generic.js" ).scanTextAndResolveLinks;

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

const TWITTER_STATUS_BASE = "https://twitter.com/";
const TWITTER_STATUS_BASE_P2 = "/status/";
function custom_format( wPost ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let wText = wPost.text;
			//console.log( wText );
			wText = await ScanTextAndResolveLinks( wText );
			//console.log( wText );
			wText = await ScanTextAndResolveLinks( wText );
			//console.log( wText );
			wText = wText.trim();
			wText = "**" + wText;
			let c1 = wText.indexOf( "pic.twitter.com" );
			if ( c1 !== -1 ) { wText = wText.insert( c1 , "** https://" ); }
			else if ( wText.indexOf( "/photo/" ) === -1 && wText.indexOf( "/video/" ) === -1 ) {
				wText = wText + "** " + wPost.permalink;
			}
			else { wText = wText + "**" }
			resolve( wText );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports = custom_format;