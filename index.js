var offset = require('offset');
var detach = require('detach');

var Popover = function(options){
  this._position = options.position || 'east';
  this.target = options.target;
  this.el = options.el;
};

/**
 * Set position `type`:
 *
 *  - `north`
 *  - `north east`
 *  - `north west`
 *  - `south`
 *  - `south east`
 *  - `south west`
 *  - `east`
 *  - `west`
 *
 * @param {String} type
 * @return {Tip}
 * @api public
 */
Popover.prototype.position = function(type) {
  this._position = type;
  return this;
};

/**
 * Show the popover
 */
Popover.prototype.show = function() {
  var self = this;
  window.addEventListener('resize', self.reposition());
  window.addEventListener('scroll', self.reposition());
  document.body.appendChild(this.el);
  this.el.classList.add(this._position);
  this.reposition();

  // Allow for CSS transitions
  var self = this;
  setTimeout(function(){
    self.el.classList.add('is-visible');
  }, 0);

  this._update();
  this._visible = true;
  return this;
};

/**
 * Update the position of the popover at set intervals
 * rapidly so that any changes to the UI won't leave the popover
 * in an incorrect position
 * @api private
 */
Popover.prototype._update = function(){
  var self = this;
  setTimeout(function(){
    self.reposition();
    if( self._visible ) {
      self._update();
    }
  }, 25);
};

/**
 * Hide the tip
 *
 * Emits "hide" event.
 *
 * @param {Number} ms
 * @return {Tip}
 * @api public
 */
Popover.prototype.hide = function(ms){
  var self = this;
  window.removeEventListener('resize', self.reposition());
  window.removeEventListener('scroll', self.reposition());
  this._visible = false;
  detach(this.el);
  this.el.classList.remove('is-visible');
  return this;
};

/**
 * Reposition the calendar if necessary.
 *
 * @api private
 */
Popover.prototype.reposition = function() {
  var pos = this._position;
  var off = this.offset(pos);
  var newpos = this.suggested(pos, off);
  this.el.style.top = off.top;
  this.el.style.left = off.left;
};

/**
 * Compute the "suggested" position favouring `pos`.
 * Returns undefined if no suggestion is made.
 *
 * @param {String} pos
 * @param {Object} offset
 * @return {String}
 * @api private
 */
Popover.prototype.suggested = function(pos, off){
  var el = this.el;

  var ew = el.offsetWidth;
  var eh = el.offsetHeight;

  var win = window;
  var top = win.scrollY;
  var left = win.scrollX;
  var w = win.innerWidth;
  var h = win.innerHeight;

  // too high
  if (off.top < top) return 'south';

  // too low
  if (off.top + eh > top + h) return 'north';

  // too far to the right
  if (off.left + ew > left + w) return 'west';

  // too far to the left
  if (off.left < left) return 'east';
};

/**
 * Compute the offset for `.target`
 * based on the given `pos`.
 *
 * @param {String} pos
 * @return {Object}
 * @api private
 */
Popover.prototype.offset = function(pos){
  var el = this.el;
  var target = this.target;

  var ew = el.offsetWidth;
  var eh = el.offsetHeight;

  var to = offset(target);
  var tw = target.offsetWidth;
  var th = target.offsetHeight;

  switch (pos) {
    case 'north':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      };
    case 'north west':
      return {
        top: to.top,
        left: to.left - ew
      };
    case 'north east':
      return {
        top: to.top,
        left: to.left + tw
      };
    case 'south':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      };
    case 'south west':
      return {
        top: to.top + th - eh * 0.85,
        left: to.left - ew
      };
    case 'south east':
      return {
        top: to.top + th - eh * 0.85,
        left: to.left + tw
      };
    case 'east':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      };
    case 'west':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left - ew
      };
    default:
      throw new Error('invalid position "' + pos + '"');
  }
};

module.exports = Popover;