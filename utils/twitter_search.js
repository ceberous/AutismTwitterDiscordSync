const Scraper = require( "simple-twitter-scraper-2" ).scraper;

function custom_search( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let keyword = "#AutismResearch" || wOptions.keyword;
			let query;
			if ( wOptions.since_id ) {
				if ( wOptions.since_id.length > 0 ) {
					query = `${keyword} since_id:${ wOptions.since_id }`;
				}
				else { query = `${keyword} `; }
			}
			else if ( wOptions.start && wOptions.end ){
				query = `${keyword} since:${wOptions.start} until:${wOptions.end}`;
			}
			else { query = `${keyword} `; }
			let wScraper = new Scraper( query , resolve );
			wScraper.interceptor = function (tweets) { }
			wScraper.start();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports = custom_search;