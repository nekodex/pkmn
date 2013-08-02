function Pokemon(number, id) {
  this.number = number;
  this.direction = "down";
  this.current_step = 0;
  this.world = null;
  this.step_size = 5;
  this.chat_timeout = null;
  this.chat = "";
  this.x = 0;
  this.y = 0;
  this.id = id || null;
}
Pokemon.prototype.sync = function(state) {
  this.x = state.x;
  this.y = state.y;
  this.number = state.pokemon;
  this.direction = state.direction;
  this.current_step = state.step;
  this.name = state.name;
}
Pokemon.prototype.talk = function(message) {
  var self = this;
  if (this.chat_timeout)
    clearTimeout(this.chat_timeout);
  this.message = message;
  this.chat_timeout = setTimeout(function(){ self.message = null; self.chat_timeout = null; }, 3000)
}
Pokemon.prototype.state = function() {
  return {x: this.x, y: this.y, pokemon: this.number, direction: this.direction, step: this.current_step, name: this.name};
}
Pokemon.prototype.step = function() {
  if (this.current_step == 0)
    this.current_step = 1;
  else
    this.current_step = 0;

  this.world.move(this.state());
}
Pokemon.prototype.moveUp = function() {
  if (this.y > 0)
    this.y -= this.step_size;
  this.direction = "up";
  this.step();
}
Pokemon.prototype.moveDown = function() {
  if (this.y < 564)
    this.y += this.step_size;
  this.direction = "down";
  this.step();
}
Pokemon.prototype.moveLeft = function() {
  if (this.x > 0)
    this.x -= this.step_size;
  this.direction = "left";
  this.step();
}
Pokemon.prototype.moveRight = function() {
  if (this.x < 774)
    this.x += this.step_size;
  this.direction = "right";
  this.step();
}
Pokemon.prototype.current_sprite = function() {
  return this.number+"-"+this.direction+"-"+this.current_step;
}
