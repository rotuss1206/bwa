(function () {
  'use strict';

  // Не даємо повторно стартувати
  if (window.__bwarch_fixed_plugin__) return;
  window.__bwarch_fixed_plugin__ = true;

  // Безпечно: якщо не в середовищі Lampa — просто вихід
  if (typeof Lampa === 'undefined') {
    console.log('[BwaRC Fixed] Not running inside Lampa');
    return;
  }

  var PLUGIN_ID = 'bwarch_fixed';
  var PLUGIN_NAME = 'BwaRC (Fixed)';
  var PLUGIN_VER = '0.1.0';

  // Просте сховище налаштувань (для майбутнього твого backend)
  var SETTINGS_KEY = 'bwarch_fixed_settings';
  function getSettings() {
    return Lampa.Storage.get(SETTINGS_KEY, {
      // Тут ти зможеш вказати свій власний сервер/ендпоїнти (якщо буде)
      api_base: ''
    });
  }
  function setSettings(patch) {
    var s = getSettings();
    for (var k in patch) s[k] = patch[k];
    Lampa.Storage.set(SETTINGS_KEY, s);
  }

  // Компонент-сторінка (екран) всередині Lampa
  function component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true });

    this.create = function () {
      return this.render();
    };

    this.start = function () {
      var s = getSettings();

      scroll.body().addClass('torrent-list'); // просто щоб стиль був схожий

      var html = $(
        '<div style="padding:1.2em; line-height:1.4;">' +
          '<div style="font-size:1.8em; margin-bottom:.4em;">' + PLUGIN_NAME + '</div>' +
          '<div style="opacity:.85; margin-bottom:1.2em;">Версія: ' + PLUGIN_VER + '</div>' +

          '<div style="margin-bottom:.8em;">Плагін успішно завантажився і працює.</div>' +

          '<div style="margin:1.2em 0 .6em; font-size:1.2em;">Налаштування</div>' +
          '<div style="opacity:.85; margin-bottom:.6em;">API Base URL (опціонально, під твій власний сервер):</div>' +
          '<input class="bwarch-fixed-input" type="text" value="' + (s.api_base || '') + '" ' +
            'style="width:100%; padding:.7em; font-size:1.1em; border-radius:.3em; border:0; outline:none;" ' +
            'placeholder="https://your-domain.com/api/" />' +

          '<div style="display:flex; gap:.8em; margin-top:1em;">' +
            '<div class="bwarch-fixed-save selector" style="padding:.7em 1.2em; border-radius:.3em; background:rgba(255,255,255,.12);">Зберегти</div>' +
            '<div class="bwarch-fixed-close selector" style="padding:.7em 1.2em; border-radius:.3em; background:rgba(255,255,255,.12);">Назад</div>' +
          '</div>' +

          '<div style="margin-top:1.2em; opacity:.7;">' +
            'Підказка: цей файл спеціально очищений від Wayback-обгорток і не залежить від rc.bwa.to.' +
          '</div>' +
        '</div>'
      );

      scroll.render().empty().append(html);

      html.find('.bwarch-fixed-save').on('hover:enter', function () {
        var val = (html.find('.bwarch-fixed-input').val() || '').trim();
        setSettings({ api_base: val });
        Lampa.Noty.show('Збережено');
      });

      html.find('.bwarch-fixed-close').on('hover:enter', function () {
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

  // Реєструємо компонент
  Lampa.Component.add(PLUGIN_ID, component);

  // Додаємо “плагін” у Manifest так, щоб він був доступний
  var manifest = {
    type: 'video',
    version: PLUGIN_VER,
    name: PLUGIN_NAME,
    description: 'Перероблена версія: завантажується стабільно, без Wayback і без зовнішніх залежностей',
    component: PLUGIN_ID,

    onContextMenu: function () {
      return { name: 'Відкрити ' + PLUGIN_NAME, description: '' };
    },

    onContextLauch: function (object) {
      Lampa.Activity.push({
        url: '',
        title: PLUGIN_NAME,
        component: PLUGIN_ID,
        page: 1,
        movie: object
      });
    }
  };

  // Підключаємо в систему плагінів
  Lampa.Manifest.plugins = manifest;

  // На випадок, якщо хочеш кнопку в “повній картці” (Full)
  function tryAddButtonInFull(card) {
    try {
      var view = Lampa.Activity.active().activity.render().find('.view--torrent');
      if (!view || !view.length) return;
      if (view.parent().find('.bwarch-fixed-btn').length) return;

      var btn = $(
        '<div class="full-start__button selector bwarch-fixed-btn" ' +
        'style="display:flex; align-items:center; gap:.8em;">' +
          '<span> ' + PLUGIN_NAME + ' </span>' +
        '</div>'
      );

      btn.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: PLUGIN_NAME,
          component: PLUGIN_ID,
          page: 1,
          movie: card
        });
      });

      view.after(btn);
    } catch (e) {}
  }

  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite' && e.data && e.data.movie) {
      tryAddButtonInFull(e.data.movie);
    }
  });

  try {
    if (Lampa.Activity.active().component === 'full') {
      tryAddButtonInFull(Lampa.Activity.active().card);
    }
  } catch (e) {}

  console.log('[BwaRC Fixed] loaded');
})();
