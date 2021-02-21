//* | Множество функций можно упростить с использованием JQuery, 
//* | но я по максимуму старался использовать native-JS, без сторонних библиотек.

//* | Код был бы аккуратнее и разбит на компоненты, если бы использовался 'Parcel' -> https://github.com/I0xAF/JS-DynamicConstructor

//#region Utils
function keysToString(array, mapFunc, separator = ''){
  if (typeof array === 'string') return array
  return Object.keys(array).map(mapFunc).join(separator)
}
function css(styles = {}){
  return keysToString(styles, key => `${key}: ${styles[key]}`, ';') + ';'
}
function classes(classes = []){
  if(typeof classes === 'string') return classes
  return classes.join(' ')
}
function attributes(attributes = []){
  return keysToString(attributes, attr => `${attr}="${attributes[attr]}"`, ' ')
}

function makeID(length) {
  let result             = ''
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789' //ABCDEFGHIJKLMNOPQRSTUVWXYZ
  for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length))
  return result
}
//#endregion

let isUseCategories = false
const wrapper = document.querySelector('.shop-wrapper')
wrapper.onmouseover = function(e) {
  if(isUseCategories){
    document.querySelector('.cat').style.display = 'none'
    document.querySelector('.level-2-up').style.visibility = 'hidden'
    isUseCategories = false
  }
}

//#region Основные объекты на которых всё строится

class $Builder {
  static CreateHTML( element, innerHTML ){
    const { tag = 'div', closing = true } = element.options
    return `<${tag} ${element.buildID()} ${element.buildCSS()} ${element.buildClasses()} ${element.buildAttributes()}>${innerHTML}${closing ? `</${tag}>` : ''}`
  }
}

class VConstructor {
  constructor(selector) {
    this.$selector = selector
    this.$el = document.querySelector(selector)
    if(!this.$el) throw new Error('Элемент не найден!')
  }
  render(model){
    this.$el.innerHtml = ''
    model.forEach(element => this.renderElement(element))
  }
  renderBlock(parentNode, parentElement){
    parentElement.elements.forEach(element => this.renderElement(element, parentNode))
  }
  renderElement(element, node = this.$el){
    node.insertAdjacentHTML('beforeend', element.toHtml())
    const added = this.getElementByHID(element.options.$hID)
    element.node = added
    this.setEvents(element, added)
    if( element.type === 'block' ) this.renderBlock(added, element)
  }
  getElementByHID(hid){
    return this.$el.querySelector(`${this.$selector} [h-id="${hid}"]`)
  }
  setEvents(element, node){
    const events = element.options.events
    if(events)
      Object.keys(events).forEach(eKey => {
        if(!node[eKey]) node[eKey] = events[eKey].bind({ site: this, self: element })
        else node.addEventListener(eKey, events[eKey].bind({ site: this, self: element }))})
  }
}

class HTML{
  constructor(options = { }){
    this.options = options
    this.options.$hID = makeID(8)
  }
  toHtml(){
    return new Error('HTML не реализован!')
  }
  buildClasses(){
    return this.options.classes ? `class="${classes(this.options.classes)}"` : ''
  }
  buildCSS(){
    return this.options.styles ? `style="${css(this.options.styles)}"` : ''
  }
  buildAttributes(){
    return this.options.attributes ? `${attributes(this.options.attributes)}` : ''
  }
  buildID(){
    return this.options.$hID ? `h-id=${this.options.$hID}` : ''
  }
}

class Element extends HTML{
  constructor(type = null, value = null, options = {}, defaultTag = 'div'){
    super(options)
    this.type = type
    this.value = value
    if(!options.tag) this.options.tag = defaultTag
  }
  toHtml(){
    return $Builder.CreateHTML(this, this.value)
  }
}

class Block extends HTML {
  constructor(elements = [], options = {}){
    super(options)
    this.elements = elements
    this.type = 'block'
  }
  toHtml(){
    return $Builder.CreateHTML(this, '')
  }
}

//#endregion

//#region Компоненты

class TitleItem extends Element {
  constructor(value, options = {}){
    super('text', value, {classes: ['title'], ...options}, 'p')
  }
}

class ImgPrimitiveItem extends Element {
  constructor(){
    super('img-primitive', '', { classes: ['i-img'] }, 'div')
  }
}

class CharacteristicsItem extends Element {
  constructor(value){
    super('text', value, {classes: ['charac']}, 'p')
  }
}

class CostItem extends Element {
  constructor(value){
    super('text', value, {classes: ['cost']}, 'p')
  }
}

class ButtonItem extends Element {
  constructor(value) {
    super('btn', value, { classes: 'btn-buy' }, 'button')
  }
}

class LiItem extends Element {
  constructor(value, options = {}){
    super('_li', value, options, 'li')
  }
}

class LinkItem extends Element {
  constructor(value, options = {}){
    super('_link', value, { attributes: {
      href: '#'
    }, ...options }, 'a')
  }
}

function CreateHref(title, liOptions = {}, linkOptions = {}){
  return new Block([
    new LinkItem(title, linkOptions)
  ], {
    tag: 'li',
    ...liOptions
  })
}

let inCategories = false

//#endregion

//#region Уровни
function CreateLevelUp(levelIndex = 1, anyLevels = [], options = {}){
  return new Block([
    ...anyLevels
  ], {
    tag: 'ul',
    classes: `level-${levelIndex}-up`,
    ...options
  })
}

function CreateLevel(levelIndex = 1, anyLevels = [], options = {}){
  return new Block([
    ...anyLevels
  ], {
    tag: 'ul',
    classes: `level-${levelIndex}`,
    ...options
  })
}
//#endregion

//#region Функции сборки блоков

function CreateCategories() {  
  return new Block([
    CreateLevelUp(1, [
      CreateHref('Каталог оборудования'),
      CreateLevel(1, [
        CreateHref('Уровень 1'),
        CreateHref('Уровень 1'),
        CreateHref('Уровень 1'),
        CreateHref('Уровень 1'),
        CreateHref('Уровень 1'),
      ])
    ], {
      events: {
        onmouseover: function(e) {
          document.querySelector('.level-2-up').style.visibility = 'visible'
        }
      }
    }),
    CreateLevelUp(2, [
      CreateHref('Уровень #2'),
      CreateLevel(3, [
        CreateLevelUp(3, [
          CreateHref('Уровень #3'),
          CreateLevelUp(4, [
            CreateHref('Уровень #4'),
            CreateHref('Уровень #4'),
          ])
        ])
      ]),
    ])
  ], {
    tag: 'div',
    classes: 'cat'
  })
}

let timeout = null

let lastOrder = 1

function CreateShopItem(title, characteristics, cost) {
  return new Block([
    new Block([
      new CostItem(cost)
    ], { classes: 'i-img' }),
    new TitleItem(title, {
      events: {
        ondblclick: function(e){
          // * Можно улучшить
          const newName = prompt('Введите новое имя товара')
          e.target.textContent = newName
          // Sending to server \\
        }
      }
    }),
    new CharacteristicsItem(characteristics),
    new ButtonItem('Купить')
  ], { classes: 'item', styles: {order: lastOrder++, 'z-index': 98}})
}

function CreateHeader(){
  return new Block( [
    new Element('', '', { 
      styles:{
       'background-color' : '#BFBFBF',
        width: '30px',
        height: '30px'
      },
      events:{
        onmouseover: function(e){
          isUseCategories = true
          document.querySelector('.cat').style.display = 'flex'
        }
      }
     })
  ], {
    styles: {
      width: '100%',
      height: '30px',
      'background-color': '#eee'
    }
  })
}

//#endregion

//#region Инициализация конструктора
const $header = new VConstructor('.h-categories')
const $shop = new VConstructor('.shop')

const modelheader = [
  new Block([
    CreateCategories(),
    CreateHeader(),
  ], {
    classes: 'container'
  })
]

const model = [
  CreateShopItem('Товар #1', '*Характеристики товара будут тут*', '5.500 ₽'),
  CreateShopItem('Товар #2', '*Характеристики товара будут тут*', '3.500 ₽'),
  CreateShopItem('Товар #3', '*Характеристики товара будут тут*', '4.500 ₽'),
  CreateShopItem('Товар #4', '*Характеристики товара будут тут*', '2.500 ₽'),
  CreateShopItem('Товар #5', '*Характеристики товара будут тут*', '5.700 ₽'),
  CreateShopItem('Товар #6', '*Характеристики товара будут тут*', '12.500 ₽'),
  CreateShopItem('Товар #7', '*Характеристики товара будут тут*', '5.800 ₽'),
  CreateShopItem('Товар #8', '*Характеристики товара будут тут*', '5.550 ₽'),
  CreateShopItem('Товар #9', '*Характеристики товара будут тут*', '1.500 ₽'),
  CreateShopItem('Товар #10', '*Характеристики товара будут тут*', '500 ₽'),
]

$header.render(modelheader)
$shop.render(model)

//#endregion