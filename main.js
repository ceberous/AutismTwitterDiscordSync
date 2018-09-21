const Reporter = require( "lilreporter" );
const RMU = require( "redis-manager-utils" );

const Sleep = require( "./utils/generic.js" ).sleep;
const TwitterSearch = require( "./utils/twitter_search.js" );
const TwitterFollowing = require( "./utils/twitter_following.js" );
const TwitterFormatPost = require( "./utils/twitter_format_post.js" );

const Personal = require( "./personal.js" );
const SinceID_Key = "MY.TWITTER.DISCORD_SYNC.SINCE_ID";
const SeenTweets_Key = "TWITTER.SEEN.IDS";

( async ()=> {

	let MyRedis = new RMU( 2 );
	await MyRedis.init();
	module.exports.redis = MyRedis;

	let MyDiscord = new Reporter( Personal );
	await MyDiscord.init();

	process.on( "unhandledRejection" , function( reason , p ) {
		let xPrps = Object.keys( reason );
		console.log( xPrps ); 
		console.error( reason , "Unhandled Rejection at Promise" , p );
		console.trace();
		if ( !reason ) { return; }
		MyDiscord.error( reason.toString() );
	});

	process.on( "uncaughtException" , function( err ) {
		console.error( err , "Uncaught Exception thrown" );
		console.trace();
		if ( !err ) { return; }
		const x11 = err.toString();
		//MyDiscord.error( err );
	});
	
	
	await Sleep( 2000 );

	// Search "#AutismResearch Every Minute"
	setInterval( async function() {

		let since_id = await MyRedis.keyGet( SinceID_Key );
		if ( !since_id ) { since_id = ""; }

		let latest = await TwitterSearch({ since_id: since_id });
		if ( latest ) { if ( latest.length > 0 ) {
			console.log( "We Have Data" );
			for ( var i = ( latest.length - 1 ); i > -1; i-- ) {
				console.log( "\nMessage: [ " + i.toString() + " ] === " );
				
				// ID Stuff
				if ( since_id !== latest.id ) { since_id = latest[ i ].id; }
				//console.log( "since_id === " + since_id );
				await MyRedis.keySet( SinceID_Key , since_id );

				// Message Content Stuff
				let new_status = await TwitterFormatPost( latest[ i ] );
				console.log( new_status );

				await MyDiscord.post( new_status );
				await Sleep( 1000 );

			}
		}}

	} , 60000 );

	// Search @autismtweeter 's Followers Timelines Every 3 Minutes
	setInterval( async function() {
		let latest_following = await TwitterFollowing();
		if ( latest_following ) {
			let ids = Object.keys( latest_following );
			if ( ids.length > 0 ) {
				//console.log( latest_following );
				let new_ids = await MyRedis.setAddArrayWithFilter( SeenTweets_Key , SeenTweets_Key , ids );
				for ( let i = 0; i < new_ids.length; ++i ) {
					//console.log( latest_following[ new_ids[ i ] ].id );
					await MyDiscord.post( latest_following[ new_ids[ i ] ].discord );
					await Sleep( 1000 );
				}
			}
		}
	} , ( 60000 * 3 ) );
	
})();