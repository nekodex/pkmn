function Overworld(server, connected_callback) {
  var self = this;
  this.log("World created!")
  this.items = [];
  this.network = new Network(server, self, self.parse);
  this.connected_callback = connected_callback;
}
Overworld.prototype.log = function(message) {
  console.log("[overworld.js] "+message);
}
Overworld.prototype.add = function(pokemon) {
  this.log("Pokemon entered: "+this.pokedex.lookup(pokemon.number).name);
  pokemon.world = this;
  this.items.push(pokemon);
  // this.refresh();
}
Overworld.prototype.find_item = function(object_id) {
  return $(this.items).filter(function() { return this.id == object_id }).get(0);
}
Overworld.prototype.move = function(state) {
  this.network.move(state)
}
Overworld.prototype.update_position = function(object_id, position) {
  this.find_item(object_id).sync(position);
}
Overworld.prototype.sync = function(state) {
  var self = this;
  console.log("worldstate", state)
  $.each(state, function(_i, object) {
    var pkmn = new Pokemon(object.pokemon, object.id)
    pkmn.sync(object)
    self.add(pkmn)
  });
}
Overworld.prototype.talk = function(message) {
  me.talk(message);
  this.network.talk(message);
}
Overworld.prototype.parse = function(data) {
  switch(data['event']) {
    case 'connect':
        this.pokedex = new Pokedex(this, data.payload.pokedex);
        this.sync(data.payload.state)
        player = this.find_item(data.payload.id);
        this.connected_callback(player);
        console.log("me:", data.payload.id, player)
      break;
    case 'sync':
      break;
    case 'join':
      var pokemon = new Pokemon(data['payload'].state.pokemon)
      pokemon.id = data['sender'];
      pokemon.sync(data['payload'].state);
      this.add(pokemon);
      break;
    case 'part':
      var id = data['sender'];
      var offset = this.items.indexOf(this.find_item(id));
      this.items.splice(offset, 1);
      delete this.find_item(id);
    case 'move':
      this.update_position(data['sender'], $.parseJSON(data['payload']));
      break;
    case 'msg':
      this.find_item(data['sender']).talk(data['payload'])
      break;
  }
}
