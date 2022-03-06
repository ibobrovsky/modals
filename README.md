Модальные окна
==============

Плагин модальных окон.

Начало работы
-------------

### Подключение ###

Поместите этот код в тег `<head>`, чтобы подключить нужные стили.

```html
<link rel="stylesheet" href="dist/modal.min.css">
```

Поместите этот код перед закрывающим тегом `<body>`, чтобы подключить скрипт.

```html
<script src="dist/modal.min.js"></script>
```

### Использование ###

Для начала создамим instance модального окна с дефолтными параметрами.
И для удобного использования, поместим его в объект window.

```javascript
(function(window) {
  // Проверяем подключение плагина
  if (!window.createModalInstance) {
    return;
  }

  // Создаем instance с дефолтными параметрами
  window.$modal = createModalInstance({
    effect: 'modal-fade',
    contentEffect: 'modal-zoom-out',
    cacheContent: true,
    modals: [
      {
        id: 'test-modal',
        preloader: '...',
        content: async () => {
          const { data } = await axios.get('...')
          return data.html
        },
      },
      {
        id: 'test-modal2',
        content: () => {
          return `
            <div style="background-color:#fff;">
              <h2>My modal</h2>
              <button data-modal-close>Закрыть</button>
            </div>
          `
        },
        contentEffect: 'modal-zoom-out',
      },
    ],
  });
})(window);
```

Теперь мы можем использовать объект $modal для управления модальными окнами.

Давайте вызовем ранее объявленое модальное окно с id "test-modal".

```html
<button id="test-modal-btn">Открыть модальное окно</button>
<script>
  (function(window) {
    if (!window.$modal) {
      return;
    }
    
    var btn = document.getElementById('test-modal-btn');
    if (!btn) {
      return;
    }
    
    btn.addEventListener('click', function() {
      $modal.show('test-modal');
    });
  })(window);
</script>
```

Чтобы закрыть это модально окно есть несколько способов:

1. Кликнуть по обласли вне контента.
2. Кликнуть по кнопке с атрибутом "data-modal-close".
3. Вызвать функцию $modal.hide('test-modal'), с нужным ID модального окна.
4. Вызвать функцию $modal.hideAll(), чтобы закрыть все открытые модальные окна.


Также можно создать экземпляр модального окна без использования ID.

```javascript
var myModal = $modal.getInstance({
  content: (params) => {
    return `
      <div style="background-color:#fff;">
        <h2>My modal</h2>
        <button onclick="$modal.hide('${params.uid}')">Закрыть</button>
      </div>
    `
  },
})


myModal.show()

myModal.hide()

myModal.destroy()
```