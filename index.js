var Popover = function(options){
  _.bindAll(this, 'reposition', 'show', 'hide');
  this._position = options.position || 'east';
  this.target = options.target;
  this.el = options.el;
};

_.extend(Popover.prototype, {

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
  position: function(type) {
    this._position = type;
    return this;
  },

  /**
   * Show the calendar
   */
  show: function() {
    this.el.appendTo('body');
    this.el.addClass(this._position);
    this.reposition();
    $(window).on('resize', this.reposition);
    $(window).on('scroll', this.reposition);

    // Allow for CSS transitions
    var self = this;
    setTimeout(function(){
      self.el.addClass('is-visible');
    }, 0);

    this._update();
    this._visible = true;
    return this;
  },

  /**
   * Update the position of the popover at set intervals
   * rapidly so that any changes to the UI won't leave the popover
   * in an incorrect position
   * @api private
   */
  _update: function(){
    var self = this;
    setTimeout(function(){
      self.reposition();
      if( self._visible ) {
        self._update();
      }
    }, 25);
  },

  /**
   * Hide the tip
   *
   * Emits "hide" event.
   *
   * @param {Number} ms
   * @return {Tip}
   * @api public
   */

  hide: function(ms){
    $(window).off('resize', this.reposition);
    $(window).off('scroll', this.reposition);
    this._visible = false;
    this.el.detach();
    this.el.removeClass('is-visible');
    return this;
  },

  /**
   * Reposition the calendar if necessary.
   *
   * @api private
   */
  reposition: function() {
    var pos = this._position;
    var off = this.offset(pos);
    var newpos = this.suggested(pos, off);
    // if (newpos) {
    //   off = this.offset(pos = newpos);
    // }
    this.el.css(off);
  },

  /**
   * Compute the "suggested" position favouring `pos`.
   * Returns undefined if no suggestion is made.
   *
   * @param {String} pos
   * @param {Object} offset
   * @return {String}
   * @api private
   */
  suggested: function(pos, off){
    var el = this.el;

    var ew = el.outerWidth();
    var eh = el.outerHeight();

    var win = $(window);
    var top = win.scrollTop();
    var left = win.scrollLeft();
    var w = win.width();
    var h = win.height();

    // too high
    if (off.top < top) return 'south';

    // too low
    if (off.top + eh > top + h) return 'north';

    // too far to the right
    if (off.left + ew > left + w) return 'west';

    // too far to the left
    if (off.left < left) return 'east';
  },

  /**
   * Compute the offset for `.target`
   * based on the given `pos`.
   *
   * @param {String} pos
   * @return {Object}
   * @api private
   */
  offset: function(pos){
    var el = this.el;
    var target = this.target;

    var ew = el.outerWidth();
    var eh = el.outerHeight();

    var to = target.offset();
    var tw = target.outerWidth();
    var th = target.outerHeight();

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
  }

});

module.exports = Popover;