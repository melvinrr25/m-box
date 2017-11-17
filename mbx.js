(function() {

  window.mbx = window.mbx || {};
  var boxActive = false;
  var stylesApplied = false;
  var htmlNode = select('html');

  function select(selector) {
    return document.querySelector(selector);
  }

  function setStyle(element, property, value) {
    if (element) {
      element.style[property] = value;
    }
  }

  var strings = {
    boxStructure: '<div class="mbx-base"><div class="mbx-body"><span class' +
      '="mbx-close">&times</span><div class="mbx-title"></div><div class' +
      '="mbx-content"></div><div class="mbx-buttons-area"></div></div></div>',
    boxBase: 'background:rgba(0,0,0,.5);position:' +
      'fixed;padding:10px;width:100%;top:0;left:0;box-sizing:border-box;' +
      'z-index:100000;height:100%!important;display:none;',
    boxBody: 'top:50%;-webkit-transform:translateY' +
      '(-50%);-moz-transform:translateY(-50%);-o-transform:translateY' +
      '(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%)' +
      ';border-radius:5px;-webkit-border-radius:5px;-moz-border-radius:' +
      '5px;-o-border-radius:5px;-ms-border-radius:5px;z-index:99999;box' +
      '-sizing:border-box;max-height:100%;overflow-x:hidden;overflow-y:' +
      'auto;position:relative;background:white;max-width:400px;margin:0 auto;',
    boxClose: 'cursor:pointer;font-size:20px;color:' +
      '#4A3C3C!important;padding:0 5px;position:absolute;top:8px;right:' +
      '8px;font-weight:bold;border-radius:4px;',
    boxTitle: 'padding:12px;font-family:"Helvetica ' +
      'Neue",Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;' +
      'background: #F8F4F4;',
    boxContent: 'padding:12px;font-family:Helvetica, Arial,sans-serif;' +
      'font-size:15px;color:#626060;',
    boxButtonsArea: 'text-align:right;padding:12px;',
    buttons: 'outline:0;border:none;border-radius:4px;text-decoration:none;' +
      'cursor:pointer;font-size:12px;display:inline-block;text-align:center;' +
      'padding:8px 12px;background:#5da8c9;color:white;margin:3px;font-weight:bold'
  };

  function setCustomStyles(settings) {
    if (settings.hasOwnProperty('styles') && stylesApplied === false) {
      for (var className in settings.styles) {
        for (var prop in settings.styles[className]) {
          setStyle(select(className), prop, settings.styles[className][prop]);
        }
      }
      stylesApplied = true;
    }
  }

  function appendBoxToBodyPage(pageBody){
     pageBody.innerHTML += strings.boxStructure;
  }

  function showBox(boxBase){
    setStyle(boxBase, 'display', 'block');
  }
  
  mbx = {
    close: function() {
      if (boxActive === true) {
        var boxBase = select('.mbx-base');
        boxBase.parentNode.removeChild(boxBase);
        boxActive = false;
        htmlNode.style.overflow = 'auto';
        if (stylesApplied === true) {
          stylesApplied = false;
        }
      }
    },

    display: function(settings, callback) {
      if ((Object.prototype.toString.call(settings) === '[object Object]')) {
        mbx.close();
        appendBoxToBodyPage(select('body'));

        var boxBase = select('.mbx-base');
        var boxBody = select('.mbx-body');
        var boxClose = select('.mbx-close');
        var boxTitle = select('.mbx-title');
        var boxContent = select('.mbx-content');
        var boxButtonsArea = select('.mbx-buttons-area');

        boxBase.setAttribute('style', strings.boxBase);
        boxBody.setAttribute('style', strings.boxBody);
        boxClose.setAttribute('style', strings.boxClose);
        boxTitle.setAttribute('style', strings.boxTitle);
        boxContent.setAttribute('style', strings.boxContent);
        boxButtonsArea.setAttribute('style', strings.boxButtonsArea);

        if (typeof settings.preventOutsideClick !== 'boolean') {
          settings.preventOutsideClick = false;
        }

        boxBase.addEventListener('click', function(e) {
          if (e.target.getAttribute('class') === 'mbx-base' &&
            settings.preventOutsideClick === false) {
            mbx.close();
          }
        });
        // close the box
        boxClose.addEventListener('click', function() {
          mbx.close();
        });
        // set the title
        if (settings.hasOwnProperty('title')) {
          boxTitle.innerHTML = settings.title;
        } else {
          boxTitle.parentNode.removeChild(boxTitle);
        }
        // set the content
        if (settings.hasOwnProperty('content')) {
          boxContent.innerHTML = settings.content;
        } else {
          if (settings.template) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                boxContent.innerHTML = this.responseText;
                setCustomStyles(settings);
                showBox(boxBase);
              }
            };
            xhttp.open('GET', settings.template, true);
            xhttp.send();
          } else {
            boxContent.parentNode.removeChild(boxContent);
          }
        }
        //set whether or not you can close the box
        if (settings.hasOwnProperty('closable')) {
          if (settings.closable === false) {
            boxClose.parentNode.removeChild(boxClose);
          }
        }

        if (settings.hasOwnProperty('time')) {
          setTimeout(function() {
            mbx.close();
            if (settings.hasOwnProperty('afterTime')) {
              if (typeof settings.afterTime === 'function') {
                settings.afterTime();
              }
            }

          }, parseInt(settings.time) * 1000);
        }

        if (settings.hasOwnProperty('width')) {
          boxBody.style['max-width'] = settings.width;
        }

        if (settings.hasOwnProperty('buttons')) {
          if (settings.buttons instanceof Array) {
            settings.buttons.forEach(function(button, index) {
              var btn = document.createElement('button');
              btn.classList.add('mbx-button-' + (index + 1));
              btn.innerHTML = button.hasOwnProperty('label') ? button.label : 'OK';

              if (button.hasOwnProperty('class')) {
                btn.classList.add(button.class);
              } else {
                btn.setAttribute('style', strings.buttons);
              }

              btn.addEventListener('click', function(e) {
                if (button.onClick && typeof button.onClick === 'function') {
                  button.onClick(e);
                } else {
                  mbx.close();
                }
              });
              boxButtonsArea.appendChild(btn);
              btn.focus();
            });
          }
        } else {
          var btn = document.createElement('button');
          btn.innerHTML = 'OK';
          btn.setAttribute('style', strings.buttons);
          btn.classList.add('mbx-button-1');
          btn.addEventListener('click', function(e) {
            mbx.close();
          });
          boxButtonsArea.appendChild(btn);
          btn.focus();
        }

        if (!settings.template) {
          setCustomStyles(settings);
          showBox(boxBase);
        }

        if (callback && typeof callback === 'function') {
          callback();
        }

        document.addEventListener('keyup', function(e) {
          if (settings.hasOwnProperty('allowedESC')) {
            if (settings.allowedESC === false) {
              return;
            }
          }
          if (e.which === 27) {
            mbx.close();
          }
        });

        htmlNode.style.overflow = 'hidden';
        boxActive = true;
        return;
      }
    }

  };

}());