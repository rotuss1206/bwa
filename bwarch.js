(function () {
  'use strict';

  // Prevent double-load
  if (window.__bwarch_icon_only__) return;
  window.__bwarch_icon_only__ = true;

  // Only runs inside Lampa
  if (typeof Lampa === 'undefined') {
    console.log('[BwaRC Icon] Not running inside Lampa');
    return;
  }

  var COMPONENT = 'bwarch_icon';
  var NAME = 'BwaRC';
  var VERSION = '0.0.1';

  // Simple screen when user launches plugin
  function component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true });

    this.create = function () {
      return this.render();
    };

    this.start = function () {
      scroll.body().addClass('torrent-list');

      var cardTitle = '';
      try {
        cardTitle = (object && object.movie && (object.movie.title || object.movie.name)) || '';
      } catch (e) {}

      var html = $(
        '<div style="padding:1.2em; line-height:1.4;">' +
          '<div style="font-size:1.8em; margin-bottom:.4em;">' + NAME + '</div>' +
          '<div style="opacity:.8; margin-bottom:1.2em;">Плагін підключений і відкривається з картки фільму/серіалу.</div>' +
          (cardTitle ? '<div style="opacity:.85; margin-bottom:1.2em;">Картка: <b>' + cardTitle + '</b></div>' : '') +
          '<div class="bwarch-close selector" style="display:inline-block; padding:.7em 1.2em; border-radius:.3em; background:rgba(255,255,255,.12);">Назад</div>' +
        '</div>'
      );

      scroll.render().empty().append(html);

      html.find('.bwarch-close').on('hover:enter', function () {
        Lampa.Activity.backward();
      });

      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(scroll.render().find('.selector')[0], scroll.render());
        },
        back: function () {
          Lampa.Activity.backward();
        }
      });

      Lampa.Controller.toggle('content');
    };

    this.render = function () {
      return scroll.render();
    };

    this.pause = function () {};
    this.stop = function () {};
    this.destroy = function () {
      scroll.destroy();
    };
  }

  // Register component
  Lampa.Component.add(COMPONENT, component);

  // Button in full card view (the "menu when you select a movie")
  function addButtonToFull(movie) {
    try {
      var root = Lampa.Activity.active().activity.render();
      var anchor = root.find('.view--torrent'); // common place where other plugins add buttons
      if (!anchor || !anchor.length) return;

      // avoid duplicates
      if (root.find('.bwarch-icon-btn').length) return;

      var btn = $(
        '<div class="full-start__button selector bwarch-icon-btn" data-subtitle="' + NAME + ' v' + VERSION + '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="24" height="24" style="margin-right:.6em;">' +
            '<path fill="currentColor" d="M14 10h18l6 6h12a4 4 0 0 1 4 4v26a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V14a4 4 0 0 1 4-4zm4 10a2 2 0 0 0-2 2v22a6 6 0 0 0 6 6h26a6 6 0 0 0 6-6V22a2 2 0 0 0-2-2H18z"/>' +
          '</svg>' +
          '<span>' + NAME + '</span>' +
        '</div>'
      );

      btn.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: NAME,
          component: COMPONENT,
          movie: movie,
          page: 1
        });
      });

      anchor.after(btn);
    } catch (e) {
      console.log('[BwaRC Icon] add button error', e);
    }
  }

  // Hook: when Full card is ready
  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite' && e.data && e.data.movie) {
      addButtonToFull(e.data.movie);
    }
  });

  // If already on full screen
  try {
    if (Lampa.Activity.active().component === 'full') {
      addButtonToFull(Lampa.Activity.active().card);
    }
  } catch (e) {}

  // Also provide context menu item (optional)
  var manifest = {
    type: 'video',
    version: VERSION,
    name: NAME,
    description: 'Тільки значок/кнопка у картці. Без джерел/серверів.',
    component: COMPONENT,
    onContextMenu: function () {
      return { name: NAME, description: '' };
    },
    onContextLauch: function (object) {
      Lampa.Activity.push({
        url: '',
        title: NAME,
        component: COMPONENT,
        movie: object,
        page: 1
      });
    }
  };

  Lampa.Manifest.plugins = manifest;

  console.log('[BwaRC Icon] loaded');
})();
