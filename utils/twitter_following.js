const Scraper = require( "scrape-twitter" );
const ScanTextAndResolveLinks = require( "./generic.js" ).scanTextAndResolveLinks;
const Personal = require( "../personal.js" );

const TWITTER_STATUS_BASE = "https://twitter.com/";
const TWITTER_STATUS_BASE_P2 = "/status/";

function GET_FOLLOWERS_LATEST() {
	return new Promise( async function( resolve , reject ) {
		try {
			let ActiveTimelines = [];
			let data_store = {};
			async function HandleNewPost( wPost ) {
				if ( data_store[ wPost.id ] ) { return; }
				//console.log( "New Stuff" );
				//console.log( wPost );
				let text1 = await ScanTextAndResolveLinks( wPost.text.trim() );
				text1 = await  ScanTextAndResolveLinks( text1 );
				let final_post = "**" + text1 + "** ";
				//if ( wPost.images.length > 0 ) { final_post = final_post + " " + wPost.images.join( " " ); }
				//if ( wPost.urls.length > 0 ) { final_post = final_post + " " + wPost.urls.map( x => x.url ).join( " " ); }
				final_post = final_post /* + "<" */ + TWITTER_STATUS_BASE + wPost.screenName + TWITTER_STATUS_BASE_P2 + wPost.id /*+ ">"*/;
				//console.log( "\nRecieved New Post from Somewhere" );
				//console.log( final_post );
				wPost.discord = final_post;
				data_store[ wPost.id ] = wPost;
			}

			ActiveTimelines = [];
			let done_count = 0;
			for ( let i = 0; i < Personal.twitter.followers.length; ++i ) {
				console.log( "Setting Up Timeline for --> @" + Personal.twitter.followers[ i ] );
				let followerTimeline = new Scraper.TimelineStream( 
					Personal.twitter.followers[ i ] ,
					{ retweets: true , count: 10 } ,
					Personal.twitter.env
				);
				followerTimeline.on( "data" , HandleNewPost );
				followerTimeline.on( "end" , function( e ) {
					done_count = done_count + 1;
					if ( done_count === Personal.twitter.followers.length ) {
						console.log( "Supposedly Done" );
						resolve( data_store );
					}
				});
				ActiveTimelines.push( followerTimeline );
			}
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports = GET_FOLLOWERS_LATEST;