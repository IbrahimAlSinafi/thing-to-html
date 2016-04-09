function thingToHTML(options) {

  ///////////
  // SETUP //
  ///////////

  // 'thing' must be an object or array.
  var type = checkType(options.thing);
  if(type !== 'Object' && type !== 'Array') {
    throw new TypeError('You must provide "thingToHTML" with an object or an array.');
  }

  // User must provide a thing (checked above) and a container.
  if(!options.container || checkType(options.container) !== 'String') {
    throw new Error("You must provide a valid CSS selector. Example: {container: '.someClass'}");
  }

  // Options.
  var thing = options.thing;
  var container = document.querySelector(options.container);
  var collapseButton = options.button;
  var theme = options.theme;

  // Indentation settings.
  var indent = 2;
  var unit = 'ch';

  // Top-level thing.
  var top = createEl('div'); // { or [
  var middle = createEl('div');
  var bottom = createEl('div'); // } or ]

  // Add classes & id's to the top-level opener & closer.
  top.className = 'top-level';
  bottom.className = 'top-level';
  top.setAttribute('id', 'top-opener');
  bottom.setAttribute('id', 'top-closer');

  // Allow theme styles to apply to container.
  if(theme) {
    container.classList.add('color'); // Used to trigger null & undefined colors.
    container.classList.add(theme);
  }
  container.classList.add('thing'); // Necessary styles for collapsing.

  // Indent the things contents.
  middle.style.marginLeft = indent + unit;

  // Top level assignment: object or array.
  type === 'Object' ? top.textContent = '{' : top.textContent = '[';
  type === 'Object' ? bottom.textContent = '}' : bottom.textContent = ']';


  /////////////
  // PROCESS //
  /////////////

  // { or [
  container.appendChild(top);

  // Process the contents via recursion.
  if(type === 'Object') {
    objToHTML(thing, middle, indent);
  } else {
    arrayToHTML(thing, middle, indent);
  }

  // Append the contents.
  container.appendChild(middle);

  // } or ]
  container.appendChild(bottom);

  // Create the collapse button & apply listeners.
  if(collapseButton) {
    var signs = document.querySelectorAll('.sign');
    var items = document.querySelectorAll('.item');
    var buttons = createEl('div', 'buttons');
    var openClose = createEl('div', 'button', 'open-close');
    var un = createEl('span', false, 'un');

    openClose.appendChild(un);
    openClose.innerHTML += 'COLLAPSE ALL';
    buttons.appendChild(openClose);
    container.insertBefore(buttons, container.firstChild);

    // Collapse / Uncollapse button: add click event listener.
    openClose.addEventListener('click', all);

    // Signs: add click event listeners.
    [].map.call(signs, function(sign) {
      sign.addEventListener('click', click);
    });

    // Items: add mouseover / mouseout event listeners.
    [].map.call(items, function(item) {
      item.addEventListener('mouseover', mouseover);
      item.addEventListener('mouseout', mouseout);
    });

    document.body.addEventListener('killThings', killThings);
    function killThings(e) {
      removeListeners();
      document.body.removeEventListener(e.type, killThings);
    }
  }


  ///////////
  // LOGIC //
  ///////////

  function checkType(obj) {
    var type = Object.prototype.toString.call(obj);
    return type.slice(8, -1);
  }
  function createEl(el, className, id) {
    var elem = document.createElement(el);
    if(className) elem.className = className;
    if(id) elem.setAttribute('id', id);
    return elem;
  }
  function oneLinerCheck(type, item) {
    var oneLiner = ['String', 'Number', 'Boolean', 'Null', 'Undefined', 'Function'].some(function(name) {
      // One-liner function check.
      if(name === 'Function' && name === type) {
        return item.toString().split('\n').length === 1 ? true : false;
      }
      return name === type;
    });

    return oneLiner;
  }
  function objToHTML(obj, container, indent) {
    var keys = Object.keys(obj);

    keys.map(function(key, i) {
      var item = obj[key];
      var type = checkType(item);

      // STRING, NUMBER, BOOLEAN, NULL, UNDEFINED
      // FUNCTION: single-line.
      if(oneLinerCheck(type, item)) {
        var itemDiv = createEl('div', 'item');
        var property = createEl('span', 'property');
        var value = createEl('span', 'value ' + type.toLowerCase());
        var nbnu = ['Number', 'Boolean', 'Null', 'Undefined'].some(function(name) { return type === name });

        property.textContent = key;
        itemDiv.appendChild(property);
        itemDiv.innerHTML += ': ';


        // ONE-LINER TYPES.
        if(type === 'String') {
          // http://goo.gl/63JDXB
          var url = /^(ftp|http|https):\/\/[^ "]+$/.test(item);
          // http://goo.gl/DeMEbe
          var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/igm.test(item);

          if(url || email) {
            var a = createEl('a', url ? 'url' : 'email');
            a.textContent = item;
            a.setAttribute('href', url ? item : 'mailto:' + item);
            if(url) a.setAttribute('target', '_blank');

            value.innerHTML += '"';
            value.appendChild(a);
            value.innerHTML += '"';
          } else {
            value.textContent = '"' + item + '"';
          }
        } else if(type === 'Null' || type === 'Undefined') {
          value.textContent = type.toLowerCase();
        } else if(type === 'Function') {
          value.textContent = item.toString();
        } else if(type === 'Number' || type === 'Boolean') {
          value.textContent = item;
        }

        itemDiv.appendChild(value);
        if(i !== keys.length - 1) itemDiv.innerHTML += ',';

        container.appendChild(itemDiv);

      // OBJECT, ARRAY
      } else if(type === 'Object' || type === 'Array') {
        // Empty objects or arrays.
        var length = type === 'Object' ? Object.keys(item).length : item.length;
        var collapser = createEl('div', 'item collapser');
        var property = createEl('span', 'property opener');
        var sign = createEl('div', 'sign open');
        var collapsee = createEl('div', 'collapsee');
        var closer = createEl('span', 'closer');

        collapsee.style.marginLeft = indent + unit;
        collapser.appendChild(sign);

        property.textContent = key;
        collapser.appendChild(property);

        collapser.innerHTML += type === 'Object' ? ': {' : ': [';
        closer.textContent = type === 'Object' ? '}' : ']';

        // For empty objects / arrays.
        if(!length) collapser.classList.add('empty');

        // Recursion.
        type === 'Array' ? arrayToHTML(item, collapsee, indent) : objToHTML(item, collapsee, indent);


        collapser.appendChild(collapsee);
        collapser.appendChild(closer);
        if(i !== keys.length - 1) collapser.innerHTML += ',';

        container.appendChild(collapser);

      // FUNCTION: multi-line.
      } else if(type === 'Function') {
        var collapser = createEl('div', 'item collapser');
        var property = createEl('span', 'property opener');
        var value = createEl('span', 'value function');
        var sign = createEl('div', 'sign open');
        var collapsee = createEl('div', 'collapsee function');
        var closer = createEl('span', 'closer function');
        var fxn = item.toString().split('\n'); // Function to an array.

        property.textContent = key;
        value.textContent = fxn[0]; // First line of the function: 'function () {';
        collapser.appendChild(property);
        collapser.innerHTML += ': ';
        collapser.appendChild(value);
        closer.textContent = '}';

        // Find the indentation offset.
        var trimmed = fxn[1].trim(); // 1st line with no leading spaces.
        var offset = fxn[1].indexOf(trimmed); // 1st line with leading spaces.

        // Append the function lines to a parent (collapsee) with proper margin per line.
        fxn.map(function(line, i) {
          if(i !== 0 && i !== fxn.length - 1) { // Skip the first & last lines.
            var fxnLine = createEl('div', 'fxn-line');
            var margin = line.indexOf(line.trim()) - offset;

            fxnLine.textContent = line.trim();

            // Refrain from applying margins of 0.
            if(margin) fxnLine.style.marginLeft = margin + unit;

            collapsee.appendChild(fxnLine);
          }
        });

        collapsee.style.marginLeft = indent + unit;

        collapser.appendChild(sign);
        collapser.appendChild(collapsee);
        collapser.appendChild(closer);
        if(i !== keys.length - 1) collapser.innerHTML += ',';

        container.appendChild(collapser);
      }
    });
  }
  function arrayToHTML(arr, container, indent) {
    var arrayContents = createEl('div', 'array-contents');

    arr.map(function(piece, i) {
      var type = checkType(piece);
      var arrayItem = createEl('div', 'array-item item');

      // STRING / NUMBER / BOOLEAN / NULL / UNDEFINED
      // FUNCTION: single-line.
      if(oneLinerCheck(type, piece)) {
        var value = createEl('span', type.toLowerCase());

        if(type === 'Null' || type === 'Undefined') {
          value.textContent = type.toLowerCase();
        } else {
          value.textContent = type === 'String' ? '"' + piece + '"' : piece;
        }

        arrayItem.appendChild(value);
        arrayContents.appendChild(arrayItem);

      // ARRAY / OBJECT / FUNCTION
      } else if(type === 'Array' || type === 'Object' || type === 'Function') {
        var collapser = createEl('div', 'collapser');
        var sign = createEl('div', 'sign open');
        var collapsee = createEl('div', 'collapsee');
        var closer = createEl('span', 'closer');

        if(type === 'Function') {
          var fxn = piece.toString().split('\n'); // Function to an array.
          collapser.className += ' function';
          collapsee.className += ' fxn function';
          closer.className += ' fxn-close function';

          collapser.textContent = fxn[0];
          closer.textContent = '}';

          // Find the indentation offset.
          var trimmed = fxn[1].trim();
          var offset = fxn[1].indexOf(trimmed);

          // Append the function lines to a parent with proper margin.
          fxn.map(function(line, i) {
            if(i !== 0 && i !== fxn.length - 1) { // Skip the first & last lines.
              var el = createEl('div', 'fxn-line');
              var margin = line.indexOf(line.trim()) - offset;

              el.textContent = line.trim();
              el.style.marginLeft = margin + unit;

              collapsee.appendChild(el);
              collapsee.style.marginLeft = indent + unit;
            }
          });

          collapser.appendChild(sign);
          arrayItem.appendChild(collapser);
          arrayItem.appendChild(collapsee);
          arrayItem.appendChild(closer);
          arrayContents.appendChild(arrayItem);

        } else {
          var length = type === 'Array' ? piece.length : Object.keys(piece).length;

          collapser.textContent = type === 'Array' ? '[' : '{';
          closer.textContent = type === 'Array' ? ']' : '}';

          // For empty objects / arrays.
          if(!length) arrayItem.classList.add('empty');

          collapsee.style.marginLeft = indent + unit;

          // Recursion.
          type === 'Array' ? arrayToHTML(piece, collapsee, indent) : objToHTML(piece, collapsee, indent);

          collapser.appendChild(sign);
          arrayItem.appendChild(collapser);
          arrayItem.appendChild(collapsee);
          arrayItem.appendChild(closer);
          arrayContents.appendChild(arrayItem);
        }
      }

      // Add commas to separate array items.
      if(i !== arr.length - 1) arrayItem.innerHTML += ',';
    });

    container.appendChild(arrayContents);
  }


  ///////////////////////////////
  // EVENTS LISTENER FUNCTIONS //
  ///////////////////////////////

  // Event functions by name.
  function click(e) {
    this.classList.toggle('closed');
    var collapser = this.parentElement;
    collapser.classList.toggle('closed');

    var collapsee = this.parentElement.querySelector('.collapsee') ||
                    this.parentElement.nextElementSibling;
    collapsee.classList.toggle('hide');

    var closer = collapsee.nextElementSibling;
    closer.classList.toggle('closed');
  }
  function mouseover(e) {
    this.classList.add('hover');
    e.stopPropagation();
  }
  function mouseout(e) {
    this.classList.remove('hover');
    e.stopPropagation();
  }

  // Open / close all levels.
  function all() {
    var dir;
    var collapsed = this.classList.contains('collapsed');
    var un = document.querySelector('#un');

    if(collapsed) {
      dir = 'open';
      this.classList.remove('collapsed');
      un.innerHTML = '';
    } else {
      dir = 'closed';
      this.classList.add('collapsed')
      un.innerHTML = 'UN-';
    }

    [].map.call(signs, function(plus) {
      var closed = plus.classList.contains('closed');
      if(dir === 'open') {
        if(closed) plus.click();
      } else if(dir === 'closed') {
        if(!closed) plus.click();
      }
    });
  }

  // Remove all event listeners.
  function removeListeners() {
    [].map.call(signs, function(sign) {
      sign.removeEventListener('click', click);
    });

    [].map.call(items, function(item) {
      item.removeEventListener('mouseover', mouseover);
      item.removeEventListener('mouseout', mouseout);
    });

    document.querySelector('#open-close').removeEventListener('click', all);
  }
}