// Функция ymaps.ready() будет вызвана, когда
// загрузятся все компоненты API, а также когда будет готово DOM-дерево.
let myMap;
ymaps.ready(init);
function init(){
    // Создание карты.
    myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [55.76, 37.64],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 10
    });
    // addPlace();
    myMap.events.add('click', function (e) {
      // myMap.balloon.open(e.get('coords'), 'Щелк!');
      console.log(e.get('coords'));
      ymaps.geocode(e.get('coords'), {
        /**
         * Опции запроса
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
         */
        // Ищем только станции метро.
        kind: 'house',
        // Запрашиваем не более 20 результатов.
        results: 1
       }).then(function (res) {
          var firstGeoObject = res.geoObjects.get(0);
          console.log(firstGeoObject.getAddressLine());
          setAddress(firstGeoObject.getAddressLine());
        });
      
    });
}



const $urlForm = document.forms.urlForm;
$urlForm.addEventListener('submit', (event) => {
  const {url} = Object.fromEntries( new FormData($urlForm ));
  event.preventDefault();
  document.querySelector('.progress').classList.toggle('invisible');
  const $parse = document.querySelector('#parse');
  $parse.innerHTML = '';
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({url})
  })
  .then (data => data.json())
  .then ( (data) => {
      // console.log (data.html);      
      document.querySelector('.progress').classList.toggle('invisible');
      $parse.innerHTML = data.html;
      $parse.addEventListener('mouseover', (event) => {
        if ([...event.target.classList].length > 0) {
          const selector = '.' + [...event.target.classList].join('.');
          // console.log( selector );
          if (selector === '.') {
            return;
          }
        
          const $all = $parse.querySelectorAll(selector);
          $all.forEach( (elem) => elem.style.backgroundColor = "orange");
          // event.target.style.backgroundColor = "orange";

          // reset the color after a short delay
          setTimeout(function() {
            $all.forEach( (elem) => elem.style.backgroundColor = "");  
          }, 500);
        }
      });

      $parse.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a') {
          event.preventDefault();
        }
        if ([...event.target.classList].length > 0) {
          const selector = '.' + [...event.target.classList].join('.');
          // console.log( selector );
          if (selector === '.') {
            return;
          }
          const $all = $parse.querySelectorAll(selector);
          const newArr = [];
          $all.forEach((elem) => newArr.push(elem.innerHTML));
          
          // console.log(newArr);
          document.querySelector('table#results').innerHTML = newArr.map( (elem, index)=> `
            <tr>
              <td>
              <label>
                <input type="checkbox" class="filled-in" name="id${index + 1}"/>
                <span>${elem}</span>
              </label>
                
              </td>
            </tr>
            `).sort();

        }
      });

    }
  )
  .catch( console.log );
})
const $toggleall = document.querySelector('#toggleall');
$toggleall.addEventListener('click', () => {
  $toggleall.parentElement.querySelectorAll('[type="checkbox"]').forEach( (elem) => {
    elem.checked = !elem.checked;
  })
})


const $choose = document.querySelector('#choose');
$choose.addEventListener('click', () => {
  const $midlleroute = document.querySelector('#midlleroute');
  $midlleroute.innerHTML = '';
  $choose.parentElement.querySelectorAll('[type="checkbox"]').forEach( (elem) => {
    if (elem.checked) {
      const addrCheckbox =  elem.parentElement.querySelector('span').innerText;
      
      if ($midlleroute.childElementCount < 3 && !elem.closest('tr').classList.contains('invisible') ) {
        $midlleroute.insertAdjacentHTML('beforeend', `
        <a class="collection-item">${addrCheckbox}</a>
        `);
      }
    }
  });
})

 
const $autocomplete = document.querySelector('#autocomplete-input');
$autocomplete.addEventListener('input', () => {
  $choose.parentElement.querySelectorAll('[type="checkbox"]').forEach( (elem) => {
    const searchIndex = elem.parentElement.querySelector('span').innerText.toLowerCase().indexOf($autocomplete.value.toLowerCase());
    console.log(elem.parentElement.querySelector('span').innerText, searchIndex);
    if ($autocomplete.value.length > 0 && searchIndex >= 0) {
      elem.closest('tr').classList.remove('invisible');
    } else {
      elem.closest('tr').classList.add('invisible');
    }
  });
})
const $tochkaA = document.querySelector('#tochkaA');
const $tochkaB = document.querySelector('#tochkaB');

function setAddress(addressFromMap) {
  document.querySelector('[data-readyforinput="true"]').value = addressFromMap;
  document.querySelectorAll('[data-readyforinput]').forEach( (elem) => {
    elem.dataset.readyforinput =  elem.dataset.readyforinput == 'true' ? false : true;
  })
}



const $calc = document.querySelector('#calc');
$calc.addEventListener('click', () => {
  myMap.geoObjects.removeAll();
  const $midlleroute = document.querySelectorAll('#midlleroute > a');
  // перебираем маршруты
  $midlleroute.forEach( (elem) => {
      const referencePoints = [$tochkaA.value, elem.innerText, $tochkaB.value];
      referencePoints.splice(1, 0, );
      // [
      //   [55.734876, 37.59308],
      //   "Москва, ул. Мясницкая"
      // ],
      const multiRoute = new ymaps.multiRouter.MultiRoute({
        // Описание опорных точек мультимаршрута.
        referencePoints,
        // Параметры маршрутизации.
        params: {
            // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
            results: 1
        }
      }, {
        // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
        boundsAutoApply: true
      });
      
      // Создаем кнопки для управления мультимаршрутом.
      var trafficButton = new ymaps.control.Button({
            data: { content: "Учитывать пробки" },
            options: { selectOnClick: true }
        }),
        viaPointButton = new ymaps.control.Button({
            data: { content: "Добавить транзитную точку" },
            options: { selectOnClick: true }
        });
      
      // Объявляем обработчики для кнопок.
      trafficButton.events.add('select', function () {
        /**
         * Задаем параметры маршрутизации для модели мультимаршрута.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel.xml#setParams
         */
        multiRoute.model.setParams({ avoidTrafficJams: true }, true);
      });
      
      trafficButton.events.add('deselect', function () {
        multiRoute.model.setParams({ avoidTrafficJams: false }, true);
      });      

      // myMap.controls = [];
      myMap.controls.add(trafficButton);
      // Добавляем мультимаршрут на карту.
      myMap.geoObjects.add(multiRoute);

      multiRoute.events.once('update', function () {
        // Установим первый маршрут, у которого нет перекрытых
        // участков, в качестве активного. Откроем его балун.
        var routes = multiRoute.getRoutes();
        console.log("Всего маршрутов: " + routes.getLength() + ".");
        const route = routes.get(0);
        
        var activeRoutePaths = route.getPaths();    
        // Проход по коллекции путей.
        var traektoriya = [];

        activeRoutePaths.each(function(path, indexPath) {
          var segments = path.getSegments();
          segments.each(function(segment, index) {
            const cords = segment.geometry.getCoordinates();
            // x = leftDown[0] + (rightUp[0] - leftDown[0]) / 2
            // y = leftDown[1] + (rightUp[1] - leftDown[1]) / 2
            // console.log(`path = ${index} ===> ${x} ===> ${y}`);
            cords.forEach( (elem) => {
              console.log(elem);
              traektoriya.push(new ymaps.Placemark(elem, {},{
                preset: 'islands#blueAutoIcon',
                iconGlyph: 'car',
              }));
            })
          }); 
        });
        let json = [];
        const stepDuration = 50;
        traektoriya.forEach((elem,index) => {
          const tId = setTimeout( () => {
            myMap.geoObjects.add( elem );
          }, stepDuration * index )
          json.push(elem.geometry.getBounds()[0])
          setTimeout( () => {
            myMap.geoObjects.remove( elem );
          }, stepDuration * index + stepDuration )
        });
        fetch('/coords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({json})
        })
        .then (data => data.json())
        .then (console.log);
        // console.log("Протяженность маршрута: ", route.properties.get("distance").text);
        elem.insertAdjacentHTML("afterbegin", `
          <span class="badge">${route.properties.get("duration").text}</span>
        `);
        // for (var i = 0; i < routes.getLength(); i++) {
        //   way = routes.get(i);
        //   segments = way.getSegments();
          
        //   for (var j = 0; j < segments.length; j++) {
        //     var street = segments[j].getCoordinates();
        //     console.log(street); 
        //   }
        // }
        function IsObject(A, prop) {
          console.log(prop, typeof A);
          return (typeof A === "object") && (A !== null)  
        }
        function objToString (obj) {
          var str = '';
          for (var p in obj) {
            if (IsObject(obj[p], p)) {
              objToString(obj[p]);
            } else {
              if (Object.prototype.hasOwnProperty.call(obj, p)) {
                  str += p + '::' + obj[p] + '\n';
              }
            }
          }
          return str;
      }
      });
    });
});

