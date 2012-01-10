/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

/**
 *
 * @author mayanksinghal
 */
var NineGAGRepost = function() {

	var badWords = ["repost", "r e p o s t"];
	var checkIfHasBadWord = function(comment) {
		comment = comment.toLowerCase();
		for (var id in badWords) {
			if (comment.indexOf(badWords[id]) >= 0) {
				return true;
			}
		}
		if (comment.match(/re{1,}po{1,}st/)) {
			return true;
		}
		return false;
	}

	var getData = function(url, toExecute, element) {
		//var requestUrl = "https://api.facebook.com/method/fql.query?" + "format=JSON"  +
		//		"&query=select+text,likes+from+comment+where+object_id+in+" +
		//		"%28select+comments_fbid+from+link_stat+where+url+%3D%27" +
		//		encodeURIComponent(url) + "%27%29&pretty=1";
		//console.log(requestUrl);
		var returnData = [];
		var getNextPart = function(offsetValue) {
			var requestUrl = "http://graph.facebook.com/fql?q=" +
					"SELECT%20text,likes%20FROM%20comment%20where%20object_id+in+" +
					"%28select+comments_fbid+from+link_stat+where+url+%3D%27" + encodeURIComponent(url) +
					"%27%29%20ORDER%20BY%20time%20LIMIT%20100%20OFFSET%20" + offsetValue;
			$.getJSON(requestUrl, function(data) {
				data = data.data;
				if (data.length > 0) {
					returnData = returnData.concat(data);
					getNextPart(offsetValue + 100);
				} else {
					toExecute(returnData, element);
				}
			});
		}
		getNextPart(0);
	}

	var parseStories = function() {
		$("li.entry-item").each(function() {
			var dataUrl = $(this).attr("data-url");
			var elementInfo = $(this).find(".info p:last");
			var showValues = function(data, element) {
				var commentCount = 0;
				var likeCount = 0;
				for (var i = 0; i < data.length; i++) {
					var comment = data[i];
					if (checkIfHasBadWord(comment.text)) {
						commentCount ++;
						likeCount += comment.likes;
						// console.log(comment.likes + " " + commentCount + " " + likeCount);
					}
				}
				var repost = $("<span class='repost'></span>");
				var repostAndLike =$("<span class='respostAndLike'></span>");
				var repostLike = $("<span class='hidden'>" + commentCount + " + " + likeCount + "</span>");
				repostAndLike.html((likeCount + commentCount))
				repost.html("<span>Repost: </span>");
				repost.append(repostAndLike);
				repost.append(repostLike);
				var displayDifferent = false;
				repost.hover(function() {
					if (displayDifferent) {
						repostLike.addClass("hidden");
						repostAndLike.removeClass("hidden");
						displayDifferent = false;
					} else {
						repostAndLike.addClass("hidden");
						repostLike.removeClass("hidden");
						displayDifferent = true;
					}
				});
				element.append(repost);
			};
			getData(dataUrl, showValues, elementInfo);
		});
	};

	var markReposts = function () {
		parseStories();
		// console.log("Parsing complete.");
		var styleEle = $("<style>span.repost {padding-left:10px;} span.hidden{display:none;}<style>");
		$("head").append(styleEle);
	};


	/**
	 * Checks if the string starts with any of the given prefixes.
	 *
	 * @param string String to be searched.
	 * @param prefixes Array of string prefixes.
	 * @return True if string starts with any of the prefixes, false otherwise.
	 */
	var hasPrefix = function (string, prefixes) {
		for (var id in prefixes) {
			if (string.indexOf(prefixes[id]) == 0) {
				return true;
			}
		}
		return false;
	};


	var initate = function() {
		markReposts();

		//var pathname = window.location.pathname;
		//var prefixes = ["/hot", "/trending", "/vote"];
		//if ((pathname === "/") || (hasPrefix(pathname, prefixes))) {
		//	// Operations for news pages.
		//	markReposts();
		//}
	};

	$(document).ready(function () {
		initate();
	});
} ();



// fql?q=SELECT text,likes,time FROM comment where  object_id = 10150558020217146 ORDER BY time LIMIT 100 OFFSET 99
