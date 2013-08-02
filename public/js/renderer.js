function Renderer(world, context) {
  this.world  = world;
  this.context = context;
  this.context.textAlign = 'center';
  this.bg = null;
  this.width = 800;
  this.height = 600;
  this.fps_limit = 30;
  this.log("Renderer initialized.");
  this.draw_timer = null;
  this.run();
}
Renderer.prototype.log = function(message) {
  console.log("[renderer.js] " + message);
}
Renderer.prototype.run = function() {
  var self = this;
  this.draw_timer = setInterval(function(){self.draw.call(self)}, 1000/self.fps_limit);
}
Renderer.prototype.stop = function() {
  clearInterval(this.draw_timer)
}
Renderer.prototype.draw = function() {
  var self = this;
  if (!this.bg)
    this.load_bg();

  self.context.fillStyle = this.bg;
  self.context.fillRect(0, 0, self.width, self.height);

  $.each(self.world.items, function(_i, item){
    self.context.fillStyle = "#fff";
    self.context.font = "10pt Calibri"
    self.draw_text(item.name, item.x+16, item.y+48)
    self.draw_sprite(item.current_sprite(), item.x, item.y, 32, 32) // magic numbers!
    if (item.message) {
      self.context.fillStyle = "#ff0000";
      self.context.font = "14pt Calibri"
      self.draw_text(item.message, item.x+16, item.y)
    }
  });
}
Renderer.prototype.draw_text = function(text, x, y) {
  this.context.fillText(text, x, y);
}
Renderer.prototype.draw_sprite = function(image, x, y, width, height) {
  this.context.drawImage($("#"+image)[0], x, y, width, height);
}
Renderer.prototype.load_bg = function() {
  this.bg = this.context.createPattern($("#bg")[0], 'repeat');
}
Renderer.prototype.load_sprites = function(sprites) {
  var self = this;
  $.each(sprites, function(name, data){
    var img = new Image();
    img.src = data;
    $(img).attr('id', name);
    $("#sprites").append(img);
  });
}
