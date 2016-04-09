(function() {

  /**********************/
  /****   EXAMPLES   ****/
  /**********************/


  var myObject = {
    string: 'This is a string.',
    boolean: true,
    null: null,
    undefined: undefined,
    numbers: 1234567890,
    url: 'https://github.com/qodesmith',
    email: 'someone@example.com',
    array: ['one', 'two', 'three'],
    object: {property: 'value'},
    singleLineFxn: function() { return 'I am a single-line function!'; },
    multiLineFxn: function() {
      var x = ['Notice', 'how', 'your', 'indentation', 'is', 'preserved?'];
      x.map(function(word) {
        console.log(word);
      });

      return 'Awesome';
    },
    arrayOfObjects: [
      {arrays: 'can', be: 'nested'},
      {as: 'deep', as: ['you', {would: 'like'}]},
      {this: {reminds: {me: {of: 'Inception'}}}}
    ]
  };

  var myArray = [
    'Various types have CSS styling for syntax highlighting.',
    'Functions are the only types not syntax highlighted',
    function singleLine() { return 'This is a single line function.' },
    function multiLine() {
      var line1 = 'This is a multi-line function ';
      var line2 = 'in an array.';
      return line1 + line2;
    },
    {numbers: 1234567890, moreNumbers: 0987654321},
    {this: {obj: {can: {be: {nested: ['like', 'crazy', {deep: undefined}]}}}}},
    ['array', ['within', 'arrays'], ['within' ['more', 'arrays']]]
  ];

  var selection = myObject;
  var timer;

  // Start with the example as an object.
  thingToHTML({
    thing: selection,
    container: '#container',
    button: true,
    theme: 'dark'
  });

  /**************************************/
  /****   EXAMPLE-SPECIFIC BUTTONS   ****/
  /**************************************/

  var thing = document.querySelector('.thing');
  var kill = new Event('killThings');

  // Theme event listeners.
  document.querySelector('#theme-dark').addEventListener('click', darkTheme);
  document.querySelector('#theme-light').addEventListener('click', lightTheme);

  // Object / Array event listeners.
  document.querySelector('#example-object').addEventListener('click', useThing);
  document.querySelector('#example-array').addEventListener('click', useThing);

  // User-input listener.
  document.querySelector('#submit').addEventListener('mousedown', submitMousedown);
  document.querySelector('#submit').addEventListener('mouseup', submitMouseup);

  // Remove all the example listeners.
  document.body.addEventListener('killThingExample', removeExample);

  function darkTheme() {
    thing.classList.remove('light');
    thing.classList.add('dark');
  }

  function lightTheme() {
    thing.classList.remove('dark');
    thing.classList.add('light');
  }

  function useThing(e) {
    var name = e.target.textContent;
    if(name === 'OBJECT' && selection === myObject) return;
    if(name === 'ARRAY' && selection === myArray) return;

    document.body.dispatchEvent(kill);
    document.querySelector('#container').innerHTML = '';

    thingToHTML({
      thing: name === 'OBJECT' ? myObject : myArray,
      container: '#container',
      button: true,
    });

    name === 'OBJECT' ? selection = myObject : selection = myArray;
  }

  function submitMousedown(e) {
    e.target.classList.add('active');
  }

  function submitMouseup(e) {
    var input = document.querySelector('#input');
    var val = input.value;
    e.target.classList.remove('active');
    clearTimeout(timer);

    if(!val) return;

    // Eval the user's input for an object or an array.
    try {
      var evaluated = eval('(' + val + ')'); // http://goo.gl/LRtVmf
      if(typeof evaluated !== 'object') throw new TypeError('You must supply an object or an array.');
    } catch(err) {
      input.classList.add('error');
      timer = setTimeout(function() {
        input.classList.remove('error');
      }, 100);

      throw err;
    }

    input.value = '';
    document.body.dispatchEvent(kill);

    // What theme do we currently have?
    var theme = thing.classList.contains('dark') ? 'dark' : 'light';

    document.querySelector('#container').innerHTML = '';

    thingToHTML({
      thing: evaluated,
      container: '#container',
      button: true,
      theme: theme
    });

    selection = '';
  }

  function removeExample(e) {
    document.body.removeEventListener(e.type, removeExample);

    document.querySelector('#theme-dark').removeEventListener('click', darkTheme);
    document.querySelector('#theme-light').removeEventListener('click', lightTheme);

    document.querySelector('#example-object').removeEventListener('click', useThing);
    document.querySelector('#example-array').removeEventListener('click', useThing);

    document.querySelector('#submit').removeEventListener('mousedown', submitMousedown);
    document.querySelector('#submit').removeEventListener('mouseup', submitMouseup);

    document.body.dispatchEvent(kill);
  };
})();