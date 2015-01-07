/*global io */
'use strict';

(function () {
  var DAY = /^\w+\s/;
  var MINS_SECS = /(:\d+):\d+/;
  var socket = io();
  var count = 0;
  var unread = 0;
  var getChatSessionStorage = window.sessionStorage.getItem('chat');
  var chatArr = [];
  var timeEls = document.querySelectorAll('time[datetime]');
  var localDate = function (timestamp) {
    var date = new Date(timestamp);
    return date.toDateString().replace(DAY, '') + ' - ' +
      date.toLocaleTimeString().replace(MINS_SECS, '$1').toLowerCase();
  };

  // set up favicon notification options
  Tinycon.setOptions({
    width: 9,
    height: 11,
    font: '10px Inconsolata',
    colour: '#5bdeff',
    background: '#fff',
    fallback: false
  });

  Tinycon.setBubble(unread);

  if (getChatSessionStorage) {
    JSON.parse(getChatSessionStorage).forEach( function (data) {
      chatArr.push(data);
      count++;
      if (count > 100) {
        count--;
        chatArr.shift();
      }
    });
  } else {
    window.sessionStorage.setItem('chat', JSON.stringify(chatArr));
  }

  socket.on('message', function (data) {
    // only notify in the favicon if the tab is not focused
    if (visibly.hidden()) {
      unread++;
      Tinycon.setBubble(unread);
    }

    chatArr.push(data);
    window.sessionStorage.setItem('chat', JSON.stringify(chatArr));
  });

  if (timeEls !== null) {
    [].forEach.call(timeEls, function (timeEl) {
      timeEl.innerText = localDate(timeEl.getAttribute('datetime'));
    });
  }

  // clear favicon alert when tab is focused
  visibly.onVisible(function () {
    unread = 0;
    Tinycon.setBubble();
  });
})();
