Модальные окна
==============

JavaScript плагин модальных окон с асинхронной подгрузкой контента.

Начало работы
-------------

### Подключение ###

Поместите этот код в тег `<head>`, чтобы подключить нужные стили

```html
<link rel="stylesheet" href="dist/modal.min.css">
```

Поместите этот код перед закрывающим тегом `<body>`, чтобы подключить скрипт

```html
<script src="dist/modal.min.js"></script>
```

### Использование ###

Создайте html контент модального окна и поместите его в любое место в теге `<body>`.
Чтобы скрыть блок используйте класс `"b-modal-hide"`
Чтобы закрыть модальное окно, используйте атрибут `"data-modal-close"`

```html
<button id="btn">Открыть модальное окно</button>

<div id="modal" class="b-modal-hide">
    <h1>modal title</h1>
    <p>modal content</p>
    <button data-modal-close>Закрыть</button>
</div>

<script>
    const modal = new Modal({
        content: 'modal', // или document.getElementById('modal')
    })
    
    const btn = document.getElementById('btn')

    btn.addEventListener('click', () => {
        modal.show()
    })
</script>
```

Пример асинхронной подгрузки контента

```html
<button id="btn">Открыть модальное окно</button>
<script>
    /**
     * В качестве имитации запрса на сервер будет использоваться следующая функция
     * @param timeout Время задержки
     * @returns {Promise} Промис
     */
    const fetchContent = (timeout) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    html: `
                        <div style="background-color: #fff;padding: 20px;max-width: 400px;">
                            <h1>fetchContent</h1>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur eius eligendi eos, excepturi expedita fugiat, ipsam modi mollitia nemo numquam perspiciatis, quas unde vero. Dolores et odit quasi sed voluptatem.</p>
                            <button data-modal-close>Закрыть</button>
                        </div>
                    `,
                    timeout
                })
                // reject('Error fetchContent')
            }, timeout)
        })
    }
    
    const modal = new Modal({
        content: async function ()
        {
            const res = await fetchContent(1000)
            return res.html || ''
        },
        cacheContent: true, // при повторном открытии модального окна, подгрузка контента выполняться не будет. Т.к. контент кэшируется.
        effect: 'modal-fade',
        contentEffect: 'modal-zoom-out'
    })
    
    const btn = document.getElementById('btn')

    btn.addEventListener('click', () => {
        modal.show()
    })
    
    // Еще один вариант использования асинхронной подгрузки
    const modal2 = new Modal({
        content: function ()
        {
            const m = this
            m._isAsyncContent = true // Установим в true, для показа прелоадера
            fetchContent(1000)
                .then((res) => {
                    m.setContent(res.html)
                })
                .catch((e) => {
                    m.setContent(e, true)
                })
            
            // возвращаем (false, null или undefined)
            return false
        }
    })
    
</script>
```


## API ##

### Параметры ###

| Параметр  | Значение по умолчанию  | Доступные значения | Тип | Описание |
| :-------- |:----------------------:| :-----------------:| :---:| :-------|
| content |  |  | `String` `Node` `Function` `Promise` | Контент модального окна. Может принимать следующие значения: Текст, ID ноды, Нода, Функция (может быть асинхронной), Промис. |
| preloader | svg иконка |  | `String` | Прелоадер. Используется, если параметр "content" является асинхронной функцией или промисом. Может быть строкой или html. |
| preloaderColor | #fff |  | `String` | Цвет прелоадера, который используется по умолчанию. Может принимать все CSS значения атрибута "color". |
| effect |  | 'modal-fade' | `String` | CSS класс, позволяющий анимировать появление и исчезновение модального окна |
| contentEffect |  | 'modal-zoom-in', 'modal-zoom-out' | `String` | CSS класс, позволяющий анимировать появление и исчезновение контента модального окна |
| cacheContent | true |  | `Boolean` | Флаг позволяющий кэшировать контент модального окна. |
| container | document.body |  | `String` `Node` | Контейнер в который будет вставлено модальное окно. |
| overflowContainer | document.body | document.body, document.documentElement, 'body', 'html' | `String` `Node` | Контейнер для которого будет применено CSS свойство "overflow: hidden" |

### Методы ###

| Метод  | Параметры  | Описание |
| :------------ |:---------------:| :---------------:|
| show | - | Открывает модальное окно |
| hide | - | Закрывает модальное окно |
| destroy | - | Уничтожает модальное окно |
| setContent | content, isError, useTransition | Меняет контент модального окна |
| $on | eventName, callback  | Подписывается на событие текущего модального окна. Такое событие можно вызвать методом $emit. Коллбэк получит все дополнительные аргументы, переданные этому методу. |
| $once | eventName, callback  | Подписывается на событие, но оно срабытывает только один раз. После первого же использования подписчик будет удалён. |
| $off | eventName, callback  | Удаляет подписчики события. |
| $emit | eventName, ...args | Вызывает событие в текущем модальном окне. Все дополнительные параметры будут переданы в коллбэк подписки. |

### Хуки жизненного цикла ###

Функции вызываемые в определенный момент жизненного цикла, например, при инициализации модального окна.

- init() Вызывается при инициализации модального окна
- beforeShow() Вызывается перед открытием модального окна
- afterShow() Вызывается после открытия модального окна
- beforeHide() Вызывается перед закрытием модального окна
- afterHide() Вызывается после закрытия модального окна
- beforeSetContent() Вызывается перед вставкой контента
- afterSetContent() Вызывается после вставки контента
- destroy() Вызывается при уничтожении модального окна

#### Пример использования: ####

```html
<script>
    const modal = new Modal({
        content: 'Hello world!',
        afterShow()
        {
            alert('Modal is show')
        },
        afterHide()
        {
            alert('Modal is hide')
        }
    })
</script>
```

### События ###

Можно подписаться на события, возникающие при вызове хука жизненного цикла.
Для этого нужно добавить "hook:" перед названием нужного хука.

Например:

```html
<script>
    const modal = new Modal({
        content: 'Hello world!',
        init()
        {
            // Функция будет отрабатывать при вызове хука "afterShow"
            this.$on('hook:afterShow', () => {
                alert('Modal is show')
            })
        }
    })
</script>
```
