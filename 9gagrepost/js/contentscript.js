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
		return false;
	}
	
	var getData = function(url, toExecute, element) {
		var requestUrl = "https://api.facebook.com/method/fql.query?" + "format=JSON"  +
				"&query=select+text,likes+from+comment+where+object_id+in+" +
				"%28select+comments_fbid+from+link_stat+where+url+%3D%27" +
				encodeURIComponent(url) + "%27%29&pretty=1";
		$.getJSON(requestUrl, function(data) {
			toExecute(data, element);
		});
	}

	var parseStories = function() {
		$("li.entry-item").each(function() {
			var dataUrl = $(this).attr("data-url");
			var elementInfo = $(this).find(".info > p");
			var showValues = function(data, element) {
				var repostCount = 0;
				for (var i = 0; i < data.length; i++) {
					var comment = data[i];
					if (checkIfHasBadWord(comment.text)) {
						repostCount += 1 + comment.likes;
					}
				}
				if (repostCount >= 0) {
					var repost = $("<span class='repost'></span>");
					repost.html("Repost: " + repostCount);
					element.append(repost);
					console.log(repostCount);
				}
			};
			getData(dataUrl, showValues, elementInfo);
		});
	};

	var markReposts = function () {
		parseStories();
		var styleEle = $("<style>span.repost {padding-left:10px;} <style>");
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


	/**
	 * Initiate operations: Keyboard Shortcuts etc.
	 */
	var initate = function() {
		var pathname = window.location.pathname;

		// Keyboard shortcuts.
		var prefixes = [ "", "/hot", "/trending", "/vote"];
		if (hasPrefix(pathname, prefixes)) {
			// Operations for news pages.
			markReposts();
		}
	};

	$(document).ready(function () {
		initate();
	});
} ();

