const button1 = document.querySelector('.button1');
const button2 = document.querySelector('.button2');
const pazzle = document.querySelector('.pazzle');

pazzle.style.border = 0;

document.querySelector('.youWin').hidden = true;

button2.hidden = true;

button1.addEventListener('click', function () {
  pazzle.style.border = '5px solid rgb(250, 175, 13)';
  button1.hidden = true;
  button2.hidden = false;

  button2.addEventListener('click', function () {
    document.querySelector('.baseImage').style.opacity = 0.5;
    setTimeout(() => document.querySelector('.baseImage').style.opacity = 0, 5000);
  });
  
  const draggableArr1 = document.getElementsByClassName('draggable');
  const draggableArr = [...draggableArr1];

  // Алгоритм случайного перемешивания Фишера-Йейтса
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  };

  shuffleArray(draggableArr);

  const pazzleEl = document.querySelector('.pazzled');

  const stepTop = 110;
  const stepLeft = 150;

  for (let i=0; i < draggableArr.length; i++) {
    draggableArr[i].style.position = 'absolute';
    draggableArr[i].style.left = '275px';
    draggableArr[i].style.top = '10px';
    pazzleEl.appendChild(draggableArr[i]);
  };

  for (i=1; i <= 5; i++) {
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }

  draggableArr[6].style.left = '275px';

  for (i=7; i <= 11; i++) {
    draggableArr[i].style.left = parseInt(draggableArr[i-1].style.left) + stepLeft + 'px';
  }

  draggableArr[12].style.left = '1175px';
  draggableArr[12].style.top = '130px';

  for (i=13; i <= 15; i++) {
    draggableArr[i].style.left = '1175px';
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }

  draggableArr[16].style.left = parseInt(draggableArr[5].style.left) + stepLeft + 100 + 'px';
  draggableArr[16].style.top = draggableArr[5].style.top;

  for (i=17; i < 20; i++) {
    draggableArr[i].style.top = draggableArr[5].style.top;
    draggableArr[i].style.left = parseInt(draggableArr[i-1].style.left) + stepLeft + 'px';
  }

  const DragManager = new function() {
      /**
       * составной объект для хранения информации о переносе:
       * {
       *   elem - элемент, на котором была зажата мышь
       *   avatar - аватар
       *   downX/downY - координаты, на которых был mousedown
       *   shiftX/shiftY - относительный сдвиг курсора от угла элемента
       * }
       */
      let dragObject = {};
    
      function onMouseDown(e) {
    
        if (e.which != 1) return;
    
        const elem = e.target.closest('.draggable');
        if (!elem) return;
    
        dragObject.elem = elem;
    
        // запомним, что элемент нажат на текущих координатах pageX/pageY
        dragObject.downX = e.pageX;
        dragObject.downY = e.pageY;
    
        return false;
      }

    
      function onMouseMove(e) {
        if (!dragObject.elem) return; // элемент не зажат
    
        if (!dragObject.avatar) { // если перенос не начат...
          const moveX = e.pageX - dragObject.downX;
          const moveY = e.pageY - dragObject.downY;
    
          // если мышь передвинулась в нажатом состоянии недостаточно далеко
          if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
            return;
          }
      
          // начинаем перенос
          dragObject.avatar = createAvatar(e); // создать аватар
          if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
            dragObject = {};
            return;
          }
    
          // аватар создан успешно
          // создать вспомогательные свойства shiftX/shiftY
          let coords = getCoords(dragObject.avatar);
          dragObject.shiftX = dragObject.downX - coords.left;
          dragObject.shiftY = dragObject.downY - coords.top;
    
          startDrag(e); // отобразить начало переноса
        }
    
        // отобразить перенос объекта при каждом движении мыши
        dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
        dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';
    
        return false;
      }
    
      function onMouseUp(e) {
        if (dragObject.avatar) { // если перенос идет
          finishDrag(e);
        }
    
        // перенос либо не начинался, либо завершился
        // в любом случае очистим "состояние переноса" dragObject
        dragObject = {};
      }

      const self = this;
    
      function finishDrag(e) {
        const dropElem = findDroppable(e);
    
        if (!dropElem) {
          self.onDragCancel(dragObject);
        } else {
          self.onDragEnd(dragObject, dropElem);
        }
      }
    
      function createAvatar(e) {
    
        // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
        let avatar = dragObject.elem;
        const old = {
          parent: avatar.parentNode,
          nextSibling: avatar.nextSibling,
          position: avatar.position || '',
          left: avatar.left || '',
          top: avatar.top || '',
          zIndex: avatar.zIndex || ''
        };
    
        // функция для отмены переноса
        avatar.rollback = function() {
          old.parent.insertBefore(avatar, old.nextSibling);
          avatar.style.position = old.position;
          avatar.style.left = old.left;
          avatar.style.top = old.top;
          avatar.style.zIndex = old.zIndex
        };
    
        return avatar;
      }
    
      function startDrag(e) {
        let avatar = dragObject.avatar;
    
        // инициировать начало переноса
        pazzleEl.appendChild(avatar);
        avatar.style.zIndex = 9999;
        avatar.style.position = 'absolute';
      }
    
      function findDroppable(event) {
        // спрячем переносимый элемент
        dragObject.avatar.hidden = true;
    
        // получить самый вложенный элемент под курсором мыши
        let elem = document.elementFromPoint(event.clientX, event.clientY);
    
        // показать переносимый элемент обратно
        dragObject.avatar.hidden = false;
    
        if (elem == null) {
          // такое возможно, если курсор мыши "вылетел" за границу окна
          return null;
        }
    
        return elem.closest('.droppable');
      }
    
      document.onmousemove = onMouseMove;
      document.onmouseup = onMouseUp;
      document.onmousedown = onMouseDown;
    
      this.onDragEnd = function(dragObject, dropElem) {};
      this.onDragCancel = function(dragObject) {};
    
    };

  function getCoords(elem) { // кроме IE8-
    const box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
  };

  const winArr = document.querySelector('.pazzled');
  const winButton = document.querySelector('.buttonWin')

  DragManager.onDragEnd = function(dragObject, dropElem) {

    if (window.getComputedStyle(dragObject.elem).backgroundPosition == 
        window.getComputedStyle(dropElem).backgroundPosition) {

    dropElem.appendChild(dragObject.elem);
    dragObject.elem.style.position = "";     
    dragObject.elem.style.top = 0;
    dragObject.elem.style.left = 0;
    dragObject.elem.style.pointerEvents = 'none';

      if (winArr.childElementCount === 0) {
        document.querySelector('.youWin').hidden = false;
        document.querySelector('.button2').hidden = true;
        document.querySelector('.pazzle').hidden = true;
        winButton.addEventListener('click', () => document.location.reload());
      }
    };
  };
});