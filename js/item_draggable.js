//Swappable items
$(function() {
  $('.item').draggable({
    start: function(){
      this.style.zIndex = 99
    },
    stop: function(event, ui){
      const thisElementCoords = getOffset(this)
      this.style.zIndex = 0; this.style.top = 0; this.style.left = 0

      const x = thisElementCoords.left + 20,
            y = thisElementCoords.top + 30

      let elementInThisPos = document.elementFromPoint(x, y)

      if(elementInThisPos && isItem(elementInThisPos)) {
        if(isChildOfItem(elementInThisPos)) elementInThisPos = elementInThisPos.parentElement
        const order = elementInThisPos.style.order
        elementInThisPos.style.order = this.style.order
        this.style.order = order
      }
    }
  });
})

function isChildOfItem(element){
  return $(element.parentElement).hasClass('item')
}

function isItem(element){
  return $(element).hasClass('item') || isChildOfItem(element)
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}