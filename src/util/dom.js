import {
    isDomNode,
    isElementNode,
    isArray,
    isString,
    isNumber,
    isNull,
    isNil,
    isUndefined,
    isObjectLike,
    isPlainObject,
    isFunction,
    isObject,
} from './type'
import { arrayMerge } from './index'

export function remove (element, wrapper)
{
    if (isDomNode(element) && (isDomNode(element.parentNode) || isDomNode(wrapper)))
    {
        const wrap = isDomNode(element.parentNode) ? element.parentNode : isDomNode(wrapper) ? wrapper : null
        if (wrap)
        {
            wrap.removeChild(element)
        }
    }
}

export function clean (element)
{
    if (isDomNode(element))
    {
        while (element.childNodes.length > 0)
        {
            element.removeChild(element.firstChild)
        }
        return
    }

    if (isString(element))
    {
        clean(document.getElementById(element))
    }
}

export function style (element, prop, value)
{
    if (isElementNode(element))
    {
        if (isNull(prop))
        {
            element.removeAttribute('style')
            return element
        }

        if (isPlainObject(prop))
        {
            Object.entries(prop).forEach((item) => {
                const [currentKey, currentValue] = item;
                style(element, currentKey, currentValue);
            })

            return element
        }

        if (isString(prop))
        {
            if (isUndefined(value) && element.nodeType !== Node.DOCUMENT_NODE)
            {
                const computedStyle = getComputedStyle(element);

                if (prop in computedStyle)
                {
                    return computedStyle[prop]
                }

                return computedStyle.getPropertyValue(prop)
            }

            if (isNull(value) || value === '' || value === 'null')
            {
                element.style[prop] = ''
                return element
            }

            if (isString(value) || isNumber(value))
            {
                element.style[prop] = value
                return element
            }
        }
    }

    return null
}

export function append (current, target)
{
    if (isDomNode(target))
    {
        if (isDomNode(current))
        {
            target.appendChild(current)
        }
        else if (isString(current))
        {
            target.insertAdjacentHTML('beforeend', current)
        }
    }
}

export function adjust (target, data = {})
{
    if (!target.nodeType)
    {
        return null
    }

    let element = target

    if (target.nodeType === Node.DOCUMENT_NODE)
    {
        element = target.body
    }

    if (isPlainObject(data))
    {
        if (isPlainObject(data.attrs))
        {
            Object.keys(data.attrs).forEach((key) => {
                if (key === 'class' || key.toLowerCase() === 'classname')
                {
                    element.className = data.attrs[key]
                    return
                }

                if (data.attrs[key] == '')
                {
                    element.removeAttribute(key)
                    return
                }

                element.setAttribute(key, data.attrs[key])
            })
        }

        if (isPlainObject(data.style))
        {
            style(element, data.style)
        }

        if (isPlainObject(data.props))
        {
            Object.keys(data.props).forEach((key) => {
                element[key] = data.props[key]
            })
        }

        if (isPlainObject(data.events))
        {
            Object.keys(data.events).forEach((key) => {
                element.addEventListener(key, data.events[key])
            })
        }

        if (isPlainObject(data.dataset))
        {
            Object.keys(data.dataset).forEach((key) => {
                element.dataset[key] = data.dataset[key]
            })
        }

        if (isString(data.children))
        {
            data.children = [data.children]
        }

        if (isArray(data.children) && data.children.length > 0)
        {
            data.children.forEach((item) => {
                if (isDomNode(item))
                {
                    append(item, element)
                }

                if (isString(item))
                {
                    element.innerHTML += item
                }
            })

            return element
        }

        if ('text' in data && !isNil(data.text))
        {
            element.innerText = data.text
            return element
        }

        if ('html' in data && !isNil(data.html))
        {
            element.innerHTML = data.html
        }
    }

    return element
}

export function create (tag, data = {}, context = document)
{
    let tagName = tag
    let options = data
    if (isObjectLike(tag))
    {
        options = tag
        tagName = tag.tag
    }

    return adjust(context.createElement(tagName), options)
}

export function findChild (obj, params, recursive, getAll)
{
    if(!obj || !obj.childNodes) return null

    recursive = !!recursive;
    getAll = !!getAll
    let n = obj.childNodes.length,
        result = []

    for (let j = 0; j < n; j++)
    {
        let child = obj.childNodes[j]

        if (_checkNode(child, params))
        {
            if (getAll)
                result.push(child)
            else
                return child
        }

        if(recursive == true)
        {
            var res = findChild(child, params, recursive, getAll)
            if (res)
            {
                if (getAll)
                    result = arrayMerge(result, res)
                else
                    return res
            }
        }
    }

    if (getAll || result.length > 0)
        return result
    else
        return null
}

export function hasClass (element, className)
{
    if (isElementNode(element))
    {
        if (isString(className))
        {
            const preparedClassName = className.trim()

            if (preparedClassName.length > 0)
            {
                if (preparedClassName.includes(' '))
                {
                    return preparedClassName.split(' ')
                        .every(name => hasClass(element, name))
                }

                if ('classList' in element)
                {
                    return element.classList.contains(preparedClassName)
                }

                if (
                    isObject(element.className)
                    && isString(element.className.baseVal)
                )
                {
                    return element.getAttribute('class').split(' ')
                        .some(name => name === preparedClassName)
                }
            }
        }

        if (isArray(className) && className.length > 0)
        {
            return className.every(name => hasClass(element, name))
        }
    }

    return false
}

export function addClass (element, className)
{
    if (isElementNode(element))
    {
        if (isString(className))
        {
            const preparedClassName = className.trim()

            if (preparedClassName.length > 0)
            {
                if (preparedClassName.includes(' '))
                {
                    addClass(element, preparedClassName.split(' '))
                    return
                }

                if ('classList' in element)
                {
                    element.classList.add(preparedClassName)
                    return
                }

                if (
                    isObject(element.className)
                    && isString(element.className.baseVal)
                )
                {
                    if (element.className.baseVal === '')
                    {
                        element.className.baseVal = preparedClassName
                        return
                    }

                    const names = element.className.baseVal.split(' ')

                    if (!names.includes(preparedClassName))
                    {
                        names.push(preparedClassName)
                        element.className.baseVal = names.join(' ').trim()
                        return
                    }
                }

                return
            }
        }

        if (isArray(className))
        {
            className.forEach(name => addClass(element, name))
        }
    }
}

export function removeClass (element, className)
{
    if (isElementNode(element))
    {
        if (isString(className))
        {
            const preparedClassName = className.trim()

            if (preparedClassName.length > 0)
            {
                if (preparedClassName.includes(' '))
                {
                    removeClass(element, preparedClassName.split(' '))
                    return;
                }

                if ('classList' in element)
                {
                    element.classList.remove(preparedClassName)
                    return
                }

                if (
                    isObject(element.className)
                    && isString(element.className.baseVal)
                )
                {
                    const names = element.className.baseVal.split(' ')
                        .filter(name => name !== preparedClassName)

                    element.className.baseVal = names.join(' ')
                    return
                }
            }
        }

        if (isArray(className))
        {
            className.forEach(name => removeClass(element, name))
        }
    }
}

function _checkNode (obj, params)
{
    params = params || {};

    if (isFunction(params))
        return params.call(window, obj)

    if (!params.allowTextNodes && !isElementNode(obj))
        return false

    let i,j,len
    for (i in params)
    {
        if(params.hasOwnProperty(i))
        {
            switch(i)
            {
                case 'tag':
                case 'tagName':
                    if (isString(params[i]))
                    {
                        if (obj.tagName.toUpperCase() != params[i].toUpperCase())
                            return false
                    }
                    else if (params[i] instanceof RegExp)
                    {
                        if (!params[i].test(obj.tagName))
                            return false
                    }
                    break;

                case 'class':
                case 'className':
                    if (isString(params[i]))
                    {
                        if (!hasClass(obj, params[i]))
                            return false
                    }
                    else if (params[i] instanceof RegExp)
                    {
                        if (!isString(obj.className) || !params[i].test(obj.className))
                            return false
                    }
                    break;

                case 'attr':
                case 'attrs':
                case 'attribute':
                    if (isString(params[i]))
                    {
                        if (!obj.getAttribute(params[i]))
                            return false
                    }
                    else if (isArray(params[i]))
                    {
                        for (j = 0, len = params[i].length; j < len; j++)
                        {
                            if (params[i] && !obj.getAttribute(params[i]))
                                return false
                        }
                    }
                    else
                    {
                        for (j in params[i])
                        {
                            if(params[i].hasOwnProperty(j))
                            {
                                var q = obj.getAttribute(j)
                                if (params[i][j] instanceof RegExp)
                                {
                                    if (!isString(q) || !params[i][j].test(q))
                                    {
                                        return false
                                    }
                                }
                                else
                                {
                                    if (q != '' + params[i][j])
                                    {
                                        return false
                                    }
                                }
                            }
                        }
                    }
                    break;

                case 'property':
                case 'props':
                    if (isString(params[i]))
                    {
                        if (!obj[params[i]])
                            return false
                    }
                    else if (isArray(params[i]))
                    {
                        for (j = 0, len = params[i].length; j < len; j++)
                        {
                            if (params[i] && !obj[params[i]])
                                return false
                        }
                    }
                    else
                    {
                        for (j in params[i])
                        {
                            if (isString(params[i][j]))
                            {
                                if (obj[j] != params[i][j])
                                    return false
                            }
                            else if (params[i][j] instanceof RegExp)
                            {
                                if (!isString(obj[j]) || !params[i][j].test(obj[j]))
                                    return false
                            }
                        }
                    }
                    break;

                case 'callback':
                    return params[i](obj)
            }
        }
    }

    return true
}