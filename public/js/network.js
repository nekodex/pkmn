function Network(server, world, callback) {
  this.server = server;
  this.world  = world;
  this.receive_callback = callback;
  this.connect();
}
Network.prototype.log = function(message) {
  console.log("[network.js] " + message);
}
Network.prototype.connect = function() {
  var self = this;
  self.log("connecting to: "+this.server);
  this.ws = ws = new WebSocket('ws://'+this.server);
  ws.onerror   = function()  { $('#welcome').hide().html("server down").fadeIn(); renderer.stop(); }
  ws.onopen    = function()  { self.log('connecting...'); }
  ws.onclose   = function()  { self.log('disconnected.'); }
  ws.onmessage = function(m) { self.parse(m.data); }
}
Network.prototype.parse = function(data) {
  data = $.parseJSON(data);
  this.receive_callback.call(this.world, data);
}
Network.prototype.join = function(username, pokemon) {
  this.log('joining');
  this.send({event: 'join', username: username, pokemon: pokemon.state(), channel: "#world"});
  this.move(pokemon.state())
}
Network.prototype.send = function(data) {
  var prepared_data = JSON.stringify(data);
  this.ws.send(prepared_data);
}
Network.prototype.talk = function(message) {
  this.send({event: 'msg', msg: message});
}
Network.prototype.move = function(state) {
  this.send({event: 'move', state: state});
}
