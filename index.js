import { token } from './settings.js';
import TelegramBot from 'node-telegram-bot-api';
import request from 'request';

const bot = new TelegramBot(token, {polling: true});
var msg1 = null;

/*
bot.on('message', (msg) => {
	var Hi = "hi";
	if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
		bot.sendMessage(msg.chat.id,"Hello dear user");
	}
	else {
		var url='https://www.google.com/inputtools/request?text='+msg.text.toString()+'&ime=transliteration_en_ru&num=1&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&uv&cb=_callbacks_._sdfsdfsdf';

		request(url, (err, resp, body) => {
			var response = body.toString();
			var start = response.indexOf("(");
			var aaa = response.substring(start);
			var params = eval(aaa);
			var result = params[1][0][1][0];

		   bot.sendMessage(msg.chat.id, result);
  		});
	}
});

bot.on("inline_query", (msg) => {
	let query = msg.query.trim();
  	bot.answerInlineQuery(msg.id, [
	{
		type: "article",
		id: "testarticle",
		title: "Transliterate",
		input_message_content: {
			message_text: "+" + query + "+"
		}
	}
  	]);
});
*/
var timer1;
var source;
var replacers = [];
var commas = [];

bot.on("polling_error", (err) => console.log(err));
bot.on("inline_query", (msg) => {
	let query = msg.query.trim();

	if (query.length == 0)
		return;

	source = parseQuery(query);
	var url = 'https://www.google.com/inputtools/request?text='+source+'&ime=transliteration_en_ru&num=1&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&uv&cb=_callbacks_._sdfsdfsdf';
	request(url, (err, resp, body) => {
		if (err)
			console.log(err)
		if (!body)
			return;

		clearTimeout(timer1);
		timer1 = setTimeout(function() {
			var response = body.toString();
			//console.log(response);
			console.log(formatDate(new Date()) + ": request");
			var params = parseInputToolsJsonp(response);
			var result = params?.[1]?.[0]?.[1]?.[0];
			if (!result)
				return;

			//console.log("source -> " + source);
			//console.log("No commas -> " + removeCommas(source));
			//console.log(commas);

			bot.answerInlineQuery(msg.id, [
			{
				type: "article",
				id: "testarticle",
				title: parseResponse(result),
				input_message_content: {
					message_text: parseResponse(result)
				}
			}]);
		}, 500);
	});
});

function parseInputToolsJsonp(responseText) {
	try {
		if (!responseText)
			return null;
		var start = responseText.indexOf('(');
		var end = responseText.lastIndexOf(')');
		if (start < 0 || end < 0 || end <= start)
			return null;
		var jsonText = responseText.slice(start + 1, end);
		return JSON.parse(jsonText);
	} catch (e) {
		console.log(e);
		return null;
	}
}

function formatDate(dt) {
	var DD = ("0" + dt.getDate()).slice(-2);
	var MM = ("0" + (dt.getMonth() + 1)).slice(-2);
	var YYYY = dt.getFullYear();

	var hh = ("0" + dt.getHours()).slice(-2);
	var mm = ("0" + dt.getMinutes()).slice(-2);
	var ss = ("0" + dt.getSeconds()).slice(-2);
	return YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;
}

function parseQuery(query) {
	var str = query;
	var result = "";
	var counter = 0;

	var opened = false;
	var pos = str.indexOf("\"");
	replacers = [];
	while (pos >= 0) {
		if (!opened)
		{
			result += str.substr(0, pos) + "\"";
		}
		else {
			replacers[replacers.length] = str.substr(0, pos);
			result += "\"";
		}
		str = str.substr(pos + 1, str.length - pos);

		opened = !opened;
		pos = str.indexOf("\"");

		if (counter > 10)
		{
			console.log("Invalid cyckle conditions. Interrupt!");
			break;
		}
		counter++;
	}

	return result + str;
}

function parseResponse(response) {
	var str = response;
	var result = "";
	var counter = 0;
	var symbol = "&quot;&quot;";
	var pos = str.indexOf(symbol);
	while (pos >= 0) {
		result += str.substr(0, pos) + "\"" + replacers[counter] + "\"";
		str = str.substr(pos + symbol.length, str.length - pos - symbol.length);
		pos = str.indexOf(symbol);

		if (counter > 10)
		{
			console.log("Invalid cyckle conditions. Interrupt!");
			break;
		}
		counter++;
	}

	return result + str;
}

function removeCommas(query) {
	var str = query;
	var result = "";
	var pos = Math.min(str.indexOf(","), str.indexOf(' '));

	var wordcounter = 0;
	var counter = 0;
	commas = [];

	//to calculate wordcounter correctly
	//str = globalReplace(str, ", ", ",");
	console.log("after replacement = " + str);
	while (pos >= 0) {
		console.log("pos = " + pos);
		var char = str.substr(pos, 1);
		result += str.substr(0, pos) + " ";
		wordcounter++;

		if (char == ",")
			commas[commas.length] = wordcounter;

		str = str.substr(pos + 1, str.length - pos);
		console.log("str = " + str);
		pos = Math.min(str.indexOf(","), str.indexOf(' '));
		console.log("after pos = " + pos);

		if (counter > 10)
		{
			console.log("Invalid cyckle conditions. Interrupt!");
			break;
		}
		counter++;
	}

	return result + str;
}

function globalReplace(str, from, to) {
	return str.replace(/s+/g, ' ');
	/*
	var result = str;
	var pos = result.indexOf(", ");
	while (pos >= 0) {
		result = result.replace(", ", ",");
		pos = result.indexOf(", ");
	}
	return result;
	*/
}