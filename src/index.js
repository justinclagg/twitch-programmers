// Webpack entry point

require('./main.css');

$(document).ready(() => {
	'use strict';
	// Configuration variables
	const featuredStreams = ['freecodecamp', 'programming', 'Shmellyorc', 'HardlyDifficult', 'NarcosVsZombies', 'DonTheDeveloper', 'JessicaMak', 'WilliamChyr', 'TheGoodIdeaCo', 'AurynSky', 'Adam13531'];
	const maxStreams = featuredStreams.length;
	const defaultLogo = 'http://i.imgsafe.org/a088ce19c3.png';
	const defaultInfo = 'Click to view on Twitch.tv';
	// Get and compile Handlebars.js stream template
	const streamTemplateScript = $('#streamTemplate').html();
	const streamTemplate = Handlebars.compile(streamTemplateScript);

	// Display featured streams
	featuredStreams.forEach(getFeaturedStream);
	// Display programming streams in Creative
	getProgrammingStreams();

	// Gets a stream and checks if it is online
	function getFeaturedStream(name) {
		$.ajax({
			dataType: 'json',
			headers: {
				'Client-ID': process.env.TWITCH_CLIENT_ID,
			},
			url: `https://api.twitch.tv/kraken/streams/${name}`
		})
		.done(json => {
			if (json.stream === null) {
				// If the stream is offline get the channel information
				getChannel(name);
			} 
			else if (json.hasOwnProperty('error')) {
				// If the channel does not exist
				const streamData = {
					streamUrl: 'https://www.twitch.tv/404',
					streamLogo: defaultLogo,
					streamName: name,
					streamInfo: 'This channel no longer exists.',
					streamStatus: 'offline'
				};
				$('#featuredStreams').append(streamTemplate(streamData));
			}
			else {
				// If the stream is online prepend the stream information
				const streamData = {
					streamUrl: json.stream.channel.url,
					streamLogo: json.stream.channel.logo || defaultLogo,
					streamName: json.stream.channel.display_name,
					streamInfo: json.stream.channel.status || defaultInfo,
					streamStatus: 'online'
				};
				$('#featuredDivider').prepend(streamTemplate(streamData));
			}
		})
		.fail(err => {
			console.log(err);
		});
	}

	// Gets channel information for offline streams
	function getChannel(name) {
		$.ajax({
			dataType: 'json',
			headers: {
				'Client-ID': process.env.TWITCH_CLIENT_ID,
			},
			url: `https://api.twitch.tv/kraken/channels/${name}`
		})
		.done(json => {
			const streamData = {
				streamUrl: json.url,
				streamLogo: json.logo || defaultLogo,
				streamName: json.display_name,
				streamInfo: json.status || defaultInfo,
				streamStatus: 'offline'
			};
			$('#featuredDivider').append(streamTemplate(streamData));
		})
		.fail(err => {
			console.log(err);
		});
	}

	// Filters out programming streams from Creative based on title. Twitch API does not provide direct access to Creative categories
	function filterProgrammingStreams(streams) {
		let programmingStreams = [];
		streams.forEach(stream => {
			if (programmingStreams.length < maxStreams && stream.channel.status.indexOf('#programming') !== -1) {
				programmingStreams.push(stream);
			}
		});
		return programmingStreams;
	}

	// Gets streams from a given game, displaying up to maxStreams
	function getProgrammingStreams() {
		$.ajax({
			dataType: 'json',
			headers: {
				'Client-ID': process.env.TWITCH_CLIENT_ID,
			},
			url: 'https://api.twitch.tv/kraken/streams?game=creative&limit=100'
		})
		.done(json => {
			const programmingStreams = filterProgrammingStreams(json.streams);

			if (programmingStreams.length === 0) {
				const streamData = {
					streamUrl: 'https://www.twitch.tv/directory/game/Creative/programming',
					streamLogo: defaultLogo,
					streamName: 'No coders found',
					streamInfo: 'Please check back later, or click to go to Twitch.tv',
					streamStatus: 'offline'
				};
				$('#searchedStreams').append(streamTemplate(streamData));
			} 
			else {
				let gameStreamsHtml = '';
				programmingStreams.forEach(stream => {
					const streamData = {
						streamUrl: stream.channel.url,
						streamLogo: stream.channel.logo || defaultLogo,
						streamName: stream.channel.display_name,
						streamInfo: stream.channel.status || defaultInfo,
						streamStatus: 'online'
					};
					gameStreamsHtml += streamTemplate(streamData);
				});
				$('#searchedStreams').append(gameStreamsHtml);
			}
			$('#loadingScreen').addClass('hidden');
			$('#streamContainer').removeClass('hidden');
		})
		.fail(err => {
			console.log(err);
		});
	}
});
