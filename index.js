const buttonLoad = document.querySelector('.buttonLoad');
const previewImageEl = document.querySelector('.miniImg--img');
const images = Array.from(document.querySelectorAll('.draggable'));
const buttonStart = document.querySelector('.buttonStart');
const buttonHelp = document.querySelector('.buttonHelp');
const buttonNextImg = document.querySelector('.buttonNextImg');
const puzzle = document.querySelector('.puzzle');
const baseImg = document.querySelector('.baseImage');
const youWin = document.querySelector('.youWin');
const puzzleElements = document.querySelector('.puzzleElements');
const miniImg = document.querySelector('.miniImg');
const hello = document.querySelector('.hello');
const timer = document.querySelector('.timer');
const buttonLoadStyle = document.querySelector('.buttonLoadStyle');

for (let i=0; i < images.length; i++){
    images[i].style.backgroundImage = 'url(https://picsum.photos/700/400)';
};

buttonLoad.addEventListener('change', () => {
  const file = buttonLoad.files[0];
  const reader  = new FileReader();

  reader.addEventListener('loadend', function () {
    previewImageEl.src = reader.result;
    baseImg.src = reader.result;
    images.forEach(img => {
      img.style.backgroundImage = `url(${reader.result})`;
    });
  });

  if (file) {
    reader.readAsDataURL(file);
  }
});

timer.hidden = true;
miniImg.hidden = true;

buttonNextImg.addEventListener('click', function () {
  document.location.reload();
});

youWin.hidden = true;
buttonHelp.hidden = true;

buttonStart.addEventListener('click', function () {
  setTimeout(function () {
    StartStop();
    for (let i=0; i < images.length; i++){
      images[i].style.opacity = 1;
      images[i].style.animation = false;
    };
  }, 3000);
  puzzle.style.top = '220px';
  puzzle.style.left = '345px';
  puzzle.style.border = '15px ridge rgb(250, 175, 13)';
  timer.hidden = false;
  hello.hidden = true;
  buttonStart.hidden = true;
  buttonHelp.hidden = false;
  buttonNextImg.hidden = true;
  miniImg.hidden = false;
  buttonLoadStyle.hidden = true;

  buttonHelp.addEventListener('click', function () {
    buttonHelp.hidden = true;
    baseImg.style.opacity = 0.23;
    baseImg.style.transition = '1.5s';
    setTimeout(function() {
      baseImg.style.opacity = 0;
      buttonHelp.hidden = false;
    }, 5000);
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

  const puzzleEl = document.querySelector('.puzzled');
  const stepTop = 110;
  const stepLeft = 150;

  for (let i=0; i < draggableArr.length; i++) {
    draggableArr[i].style.position = 'absolute';
    draggableArr[i].style.left = '17px';
    draggableArr[i].style.top = '135px';
    puzzleEl.appendChild(draggableArr[i]);
  };

  for (i=1; i <= 4; i++) {
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }
  draggableArr[5].style.left = parseInt(draggableArr[0].style.left) + stepLeft + 'px';
  for (i=6; i <= 9; i++) {
    draggableArr[i].style.left = draggableArr[5].style.left;
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }
  draggableArr[10].style.left = '1120px';
  for (i=11; i <= 14; i++) {
    draggableArr[i].style.left = draggableArr[10].style.left;
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }
  draggableArr[15].style.left = parseInt(draggableArr[10].style.left) + stepLeft + 'px';
  for (i=16; i < 20; i++) {
    draggableArr[i].style.left = draggableArr[15].style.left;
    draggableArr[i].style.top = parseInt(draggableArr[i-1].style.top) + stepTop + 'px';
  }

  const DragManager = new function () {
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
        puzzleEl.appendChild(avatar);
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

  const winArr = document.querySelector('.puzzled');
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
      document.querySelector('.game').style.margin = 0;
      // **************************************************************************************************
      // -----------------CANVAS_ANIMATION-----------------------------------------------------------------
      // **************************************************************************************************
      const rndColor = () => {
        const base  = Math.random() * 360 | 0;
        const color = (275 * (base / 200 | 0)) + base % 200;
        return fac => `hsl(${color}, ${(fac || 1) * 100}%, ${(fac || 1) * 60}%)`;
      };
      class Battery
      {
        constructor(fireworks) {
            this.fireworks = fireworks;
            this.salve = [];
            this.x     = Math.random();
            this.t     = 0;
            this.tmod  = 20 + Math.random() * 20 | 0;
            this.tmax  = 500 + Math.random() * 1000;

            this._shot = salve => {
                if (salve.y < salve.ym) {
                    salve.cb = this._prepareExplosion;
                }
                salve.x += salve.mx;
                salve.y -= 0.01;

                const r = Math.atan2(-0.01, salve.mx);

                this.fireworks.engine.strokeStyle = salve.c(.7);
                this.fireworks.engine.beginPath();

                this.fireworks.engine.moveTo(
                    (this.x + salve.x) * this.fireworks.width + Math.cos(r) * 4,
                    salve.y * this.fireworks.height + Math.sin(r) * 4
                );
                this.fireworks.engine.lineTo(
                    (this.x + salve.x) * this.fireworks.width + Math.cos(r + Math.PI) * 4,
                    salve.y * this.fireworks.height + Math.sin(r + Math.PI) * 4
                );
                this.fireworks.engine.lineWidth = 3;
                this.fireworks.engine.stroke();
            };
            this._prepareExplosion = salve => {
                salve.explosion = [];

                for (let i = 0, max = 32; i < max; i++) {
                    salve.explosion.push({
                        r : 2 * i / Math.PI,
                        s : 0.5 + Math.random() * 0.5,
                        d : 0,
                        y : 0
                    });
                }
                salve.cb = this._explode;
            };
            this._explode = salve => {
                this.fireworks.engine.fillStyle = salve.c();

                salve.explosion.forEach(explo => {
                    explo.d += explo.s;
                    explo.s *= 0.99;
                    explo.y += 0.5;

                    const alpha = explo.s * 2.5;
                    this.fireworks.engine.globalAlpha = alpha;

                    if (alpha < 0.05) {
                        salve.cb = null;
                    }
                    this.fireworks.engine.fillRect(
                        Math.cos(explo.r) * explo.d + (this.x + salve.x) * this.fireworks.width,
                        Math.sin(explo.r) * explo.d + explo.y + salve.y * this.fireworks.height,
                        3,
                        3
                    );
                });
                this.fireworks.engine.globalAlpha = 1;
            }
        }
        pushSalve() {
            this.salve.push({
                x: 0,
                mx: -0.02 * Math.random() * 0.04,
                y: 1,
                ym: 0.05 + Math.random() * 0.5,
                c: rndColor(),
                cb: this._shot
            });
        };
        render() {
            this.t++;

            if (this.t < this.tmax && (this.t % this.tmod) === 0) {
                this.pushSalve();
            }
            let rendered = false;

            this.salve.forEach(salve => {

                if (salve.cb) {
                    rendered = true;
                    salve.cb(salve);
                }
            });
            if (this.t > this.tmax) {
                return rendered;
            }
            return true;
        }
      }
      class Fireworks
      {
        constructor() {
            this.canvas = window.document.querySelector('canvas');
            this.engine = this.canvas.getContext('2d');
            this.stacks = new Map();
            this.resize();
        }
        resize() {
            this.width  = window.innerWidth;
            this.height = window.innerHeight;

            this.canvas.setAttribute('width', this.width);
            this.canvas.setAttribute('height', this.height);
        }
        clear() {
            this.engine.clearRect(0, 0, this.width, this.height);
            this.engine.fillStyle = '#222';
            this.engine.fillRect(0, 0, this.width, this.height);
        }
        addBattery() {
          const bat = new Battery(this);
          this.stacks.set(Date.now(), bat);  
        }
        render() {
            if (Math.random() < 0.05) {
              this.addBattery();
            }
            this.clear();

            this.stacks.forEach((scene, key) => {
                const rendered = scene.render();

                if (!rendered) {
                    this.stacks.delete(key);
                }
            });
            requestAnimationFrame(this.render.bind(this));
        }
        run() {
            for(let i = 0; i < 5; i++) {
              this.addBattery();
            }
            window.addEventListener('resize', this.resize.bind(this));
            this.render();
        }
      }
      a = new Fireworks();
      a.run();
      // **************************************************************************************************
      // **************************************************************************************************
      StartStop();
      document.querySelector('.developer').hidden = true;
      timer.style.top = '70px';
      timer.style.left = 0;
      timer.style.right = 0;
      youWin.appendChild(timer);
      buttonHelp.hidden = true;
      miniImg.hidden = true;
      puzzle.style.top = '110px';
      baseImg.style.transition = false;
      baseImg.style.opacity = 1;
      puzzleElements.hidden = true;
      setTimeout(function () {
        youWin.hidden = false;
      }, 4500);
      winButton.addEventListener('click', () => document.location.reload());
      };
    };
  };
});
//--------------------Таймер-----------------------
const base = 60;
let clocktimer, dateObj, dh, dm, ds;
let readout = '';
let h = 1, m = 1, tm = 1, s = 0, ts = 0, ms = 0, init = 0;

//функция для очистки поля
function ClearСlock() {
    clearTimeout(clocktimer);
    h = 1; m = 1; tm = 1; s = 0; ts = 0; ms = 0;
    init = 0;
    readout = '00:00:00';
    document.timerForm.stopwatch.value=readout;
}
//функция для старта секундомера
function StartTIME() {
    let cdateObj = new Date();
    let t = (cdateObj.getTime() - dateObj.getTime()) - (s * 1000);
    if (t > 999) { s++; }
    if (s >= (m * base)) {
            ts = 0;
            m++;
    } else {
            ts = parseInt((ms / 100) + s);
            if ( ts >= base) { ts = ts - ((m - 1) * base); }
    }
    if (m > (h * base)) {
            tm = 1;
            h++;
    } else {
            tm = parseInt((ms / 100) + m);
            if (tm >= base) { tm = tm - ((h - 1) * base); }
    }
    ms = Math.round(t / 10);
    if (ms > 99) {ms = 0;}
    if (ms == 0) {ms = '00';}
    if (ms > 0 && ms <= 9) { ms = '0' + ms; }
    if (ts > 0) { ds = ts; if (ts < 10) { ds = '0' + ts; }} else { ds = '00'; }
    dm = tm - 1;
    if (dm > 0) { if (dm < 10) { dm = '0' + dm; }} else { dm = '00'; }
    dh = h - 1;
    if (dh > 0) { if (dh < 10) { dh = '0' + dh; }} else { dh = '00'; }
    readout = dh + ':' + dm + ':' + ds;
    document.timerForm.stopwatch.value = readout;
    clocktimer = setTimeout("StartTIME()", 1);
}
//Функция запуска и остановки
function StartStop() {
    if (init == 0){
            ClearСlock();
            dateObj = new Date();
            StartTIME();
            init = 1;
    } else {
            clearTimeout(clocktimer);
            init = 0;
    }
};